# /bin/bash
# Craete a simple azure function app

# Usage:
# ./create_function.sh

# Global variables
LOCATION="eastus"

# Create a resource group
RESOURCE_GROUP_NAME="rg-observability-demo"

az group create \
    --name "${RESOURCE_GROUP_NAME}" \
    --location "${LOCATION}"

# Create a storage account
STORAGE_ACCOUNT_NAME="sagreetingsjavascript"

az storage account create \
    --name "${STORAGE_ACCOUNT_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --location "${LOCATION}" \
    --sku Standard_LRS

# Create App Insights
APP_INSIGHTS_NAME="ai-greetings-javascript"

az monitor app-insights component create \
    --app "${APP_INSIGHTS_NAME}" \
    --location "${LOCATION}" \
    --resource-group "${RESOURCE_GROUP_NAME}"

# Get App Insights Instrumentation Key
APP_INSIGHTS_INSTRUMENTATION_KEY=$(
    az monitor app-insights component show \
        --app "${APP_INSIGHTS_NAME}" \
        --resource-group "${RESOURCE_GROUP_NAME}" \
        --query "instrumentationKey" \
        --output tsv
)

# Create a function app
FUNCTION_APP_NAME="fn-greetings-java"

az functionapp create \
    --name "${FUNCTION_APP_NAME}" \
    --storage-account "${STORAGE_ACCOUNT_NAME}" \
    --app-insights "${APP_INSIGHTS_NAME}" \
    --app-insights-key "${APP_INSIGHTS_INSTRUMENTATION_KEY}" \
    --consumption-plan-location "${LOCATION}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --runtime java \
    --runtime-version 17 \
    --functions-version 4 \
    --os-type Linux

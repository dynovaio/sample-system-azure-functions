# /bin/bash
# Configure function app to stream logs to Event Hub

# Usage:
# ./configure_function.sh NEW_RELIC_LICENSE_KEY

# Parameters:
# - NEW_RELIC_LICENSE_KEY: New Relic license key

# Read parameters
NEW_RELIC_LICENSE_KEY=$1

if [ -z "$NEW_RELIC_LICENSE_KEY" ]; then
    echo "NEW_RELIC_LICENSE_KEY is required"
    exit 1
fi

# Global variables
NEW_RELIC_APP_NAME="fn-greetings-javascript"

LOCATION="eastus"
RESOURCE_GROUP_NAME="rg-observability-demo"
FUNCTION_APP_NAME="fn-greetings-javascript"

# Create settings for New Relic
az functionapp config appsettings set \
    --name "${FUNCTION_APP_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --settings "NEW_RELIC_LICENSE_KEY=${NEW_RELIC_LICENSE_KEY}"

az functionapp config appsettings set \
    --name "${FUNCTION_APP_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --settings "NEW_RELIC_APP_NAME=${NEW_RELIC_APP_NAME}"

az functionapp config appsettings set \
    --name "${FUNCTION_APP_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --settings "NEW_RELIC_LOG_LEVEL=info"

az functionapp config appsettings set \
    --name "${FUNCTION_APP_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --settings "NEW_RELIC_LOG_ENABLED=true"

az functionapp config appsettings set \
    --name "${FUNCTION_APP_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --settings "NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true"

az functionapp config appsettings set \
    --name "${FUNCTION_APP_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --settings "NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED=false"

az functionapp config appsettings set \
    --name "${FUNCTION_APP_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --settings "NEW_RELIC_APPLICATION_LOGGING_LOCAL_DECORATING_ENABLED=false"

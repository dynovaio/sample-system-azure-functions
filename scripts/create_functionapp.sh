#! /bin/bash
# -----------------------------------------------------------------------------
# File:
# create_functionapp.sh
#
# Authors:
# * Martin Vuelta <zodiacfireworks@softbutterfly.io>
# * SoftButterfly Dev Team <dev@softbutterfly.io>
#
# Description:
# This script will create a function app in Azure.
#
# Usage:
# ./create_functionapp.sh $resource_group_name \
#     $project_name \
#     $function_app_runtime \
#     $function_app_runtime_version \
#     $resource_group_name \
#     $location
#
# Parameters:
# * $project_name                 : Name of the project.
# * $function_app_runtime         : Runtime of the function app.
# * $function_app_runtime_version : Runtime version of the function app.
# * $resource_group_name          : Name of the resource group.
# * $location                     : Location of the resource group.
#
# Example:
# ./create_functionapp.sh \
#     myProject \
#     node \
#     14 \
#     myResourceGroup \
#     eastus
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# Preamble:
# ---------

# Global variables
DEFAULT_LOCATION="eastus"

# -----------------------------------------------------------------------------
# Input validation:
# -----------------

# Check if function app name is provided
if [ -z "$1" ]; then
    echo "[ERR] Project name is not provided."
    exit 1
else
    PROJECT_NAME="$1"
fi

# Check if function app runtime is provided
if [ -z "$2" ]; then
    echo "[ERR] Function app runtime is not provided."
    exit 1
else
    FUNCTION_APP_RUNTIME="$2"
fi

# Check if function app version is provided
if [ -z "$3" ]; then
    echo "[ERR] Function app version is not provided."
    exit 1
else
    FUNCTION_APP_RUNTIME_VERSION="$3"
fi

# Check if resource group name is provided
if [ -z "$4" ]; then
    echo "[ERR] Resource group name is not provided."
    exit 1
else
    RESOURCE_GROUP_NAME="$4"
fi

# Check if location is provided
if [ -z "$5" ]; then
    echo "[WARN] Location is not provided. Using default location '${DEFAULT_LOCATION}'."
    LOCATION="${DEFAULT_LOCATION}"
else
    LOCATION="$5"
fi

# -----------------------------------------------------------------------------
# Execution:
# ----------

# Get random suffix from .random_sufix file or generate a new one
cd $PROJECT_NAME

if [ -f .random_suffix ]; then
    RANDOM_SUFFIX=$(cat .random_suffix)
else
    RANDOM_SUFFIX=$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 8 | head -n 1)
    echo "${RANDOM_SUFFIX}" > .random_suffix
fi

# Create storage account
STORAGE_ACCOUNT_NAME="${PROJECT_NAME%@*}"
STORAGE_ACCOUNT_NAME="${STORAGE_ACCOUNT_NAME%@*}"
STORAGE_ACCOUNT_NAME="$(echo "${STORAGE_ACCOUNT_NAME}" | sed 's/[ -_]//g')"
STORAGE_ACCOUNT_NAME="sa${STORAGE_ACCOUNT_NAME}data${RANDOM_SUFFIX}"
STORAGE_ACCOUNT_NAME="$(echo "${STORAGE_ACCOUNT_NAME}" | fold -w 24 | head -n 1)"

az storage account create \
    --name "${STORAGE_ACCOUNT_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --location "${LOCATION}" \
    --sku "Standard_LRS" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "[INFO] Storage account '${STORAGE_ACCOUNT_NAME}' created successfully."
else
    echo "[ERR] Failed to create storage account '${STORAGE_ACCOUNT_NAME}'."
    exit 1
fi

# Create app insights
APP_INSIGHTS_NAME="${PROJECT_NAME%@*}"
APP_INSIGHTS_NAME="${APP_INSIGHTS_NAME%@*}"
APP_INSIGHTS_NAME="ai$(echo "${APP_INSIGHTS_NAME}" | sed 's/[ -_]//g')${RANDOM_SUFFIX}"

az monitor app-insights component create \
    --app "${APP_INSIGHTS_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --location "${LOCATION}" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "[INFO] App insights '${APP_INSIGHTS_NAME}' created successfully."
else
    echo "[ERR] Failed to create app insights '${APP_INSIGHTS_NAME}'."
    exit 1
fi

# Get app insights instrumentation key
APP_INSIGHTS_INSTRUMENTATION_KEY=$(
    az monitor app-insights component show \
        --app "${APP_INSIGHTS_NAME}" \
        --resource-group "${RESOURCE_GROUP_NAME}" \
        --query "instrumentationKey" \
        --output tsv
)

# Create function app
FUNCTION_APP_NAME="${PROJECT_NAME%@*}"
FUNCTION_APP_NAME="${FUNCTION_APP_NAME%@*}"
FUNCTION_APP_NAME="fn-${FUNCTION_APP_NAME}-${RANDOM_SUFFIX}"

az functionapp create \
    --name "${FUNCTION_APP_NAME}" \
    --storage-account "${STORAGE_ACCOUNT_NAME}" \
    --app-insights "${APP_INSIGHTS_NAME}" \
    --app-insights-key "${APP_INSIGHTS_INSTRUMENTATION_KEY}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --consumption-plan-location "${LOCATION}" \
    --runtime "${FUNCTION_APP_RUNTIME}" \
    --runtime-version "${FUNCTION_APP_RUNTIME_VERSION}" \
    --functions-version 4 \
    --os-type "Linux" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    sleep 10
    echo "[INFO] Function app '${FUNCTION_APP_NAME}' created successfully."
    exit 0
else
    echo "[ERR] Failed to create function app '${FUNCTION_APP_NAME}'."
    exit 1
fi

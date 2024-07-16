#! /bin/bash
# -----------------------------------------------------------------------------
# File:
# configure_functionapp.sh
#
# Authors:
# * Martin Vuelta <zodiacfireworks@softbutterfly.io>
# * SoftButterfly Dev Team <dev@softbutterfly.io>
#
# Description:
# This script will configure the environment variables for the function with
# New Relic.
#
# Usage:
# ./configure_functionapp.sh \
#     $project_name \
#     $function_app_runtime \
#     $resource_group_name \
#     $new_relic_license_key
#
# Parameters:
# * $project_name          : Name of the project.
# * $function_app_runtime  : Runtime of the function app.
# * $resource_group_name   : Name of the resource group.
# * $new_relic_license_key : New Relic license key.
#
# Example:
# ./configure_functionapp.sh \
#     myProject \
#     java \
#     myResourceGroup \
#     1234567890
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# Input validation:
# -----------------

# Check if the project name is provided
if [ -z "$1" ]; then
    echo "[ERR] Project name is not provided."
    exit 1
else
    PROJECT_NAME="$1"
    FUNCTION_APP_NAME="fn-${PROJECT_NAME}"
fi

# Check if the function app runtime is provided
if [ -z "$2" ]; then
    echo "[ERR] Function app runtime is not provided."
    exit 1
else
    FUNCTION_APP_RUNTIME="$2"
fi

# Check if the resource group name is provided
if [ -z "$3" ]; then
    echo "[ERR] Resource group name is not provided."
    exit 1
else
    RESOURCE_GROUP_NAME="$3"
fi

# Check if the new relic license key is provided
if [ -z "$4" ]; then
    echo "[ERR] New Relic license key is not provided."
    exit 1
else
    NEW_RELIC_LICENSE_KEY="$4"
fi

# -----------------------------------------------------------------------------
# Execution:
# ----------

# Configure the function app settings
if [ "${FUNCTION_APP_RUNTIME}" == "java" ]; then
    az functionapp config appsettings set \
        --name "${FUNCTION_APP_NAME}" \
        --resource-group "${RESOURCE_GROUP_NAME}" \
        --settings \
            "NEW_RELIC_LICENSE_KEY=${NEW_RELIC_LICENSE_KEY}" \
            "NEW_RELIC_APP_NAME=${FUNCTION_APP_NAME}" \
            "NEW_RELIC_AGENT_ENABLED=true" \
            "NEW_RELIC_LOG_LEVEL=info" \
            "NEW_RELIC_LOG_ENABLED=true" \
            "NEW_RELIC_LOG_FILE_NAME=stdout" \
            "NEW_RELIC_DISTIBUTED_TRACING_ENABLED=true" \
            "NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED=false" \
            "NEW_RELIC_APPLICATION_LOGGING_LOCAL_DECORATING_ENABLED=true" \
            "languageWorkers__java__arguments=-javaagent:/home/site/wwwroot/lib/newrelic-agent-8.12.0.jar" \
            "WEBSITE_USE_PLACEHOLDER=0"
elif [ "${FUNCTION_APP_RUNTIME}" == "node" ]; then
    az functionapp config appsettings set \
        --name "${FUNCTION_APP_NAME}" \
        --resource-group "${RESOURCE_GROUP_NAME}" \
        --settings \
            "NEW_RELIC_LICENSE_KEY=${NEW_RELIC_LICENSE_KEY}" \
            "NEW_RELIC_APP_NAME=${FUNCTION_APP_NAME}" \
            "NEW_RELIC_AGENT_ENABLED=true" \
            "NEW_RELIC_LOG_LEVEL=info" \
            "NEW_RELIC_LOG_ENABLED=true" \
            "NEW_RELIC_LOG_FILE_NAME=stdout" \
            "NEW_RELIC_DISTIBUTED_TRACING_ENABLED=true" \
            "NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED=false" \
            "NEW_RELIC_APPLICATION_LOGGING_LOCAL_DECORATING_ENABLED=true"
else
    echo "[ERR] Unsupported function runtime '${FUNCTION_APP_RUNTIME}'."
    exit 1
fi

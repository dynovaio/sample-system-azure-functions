#! /bin/bash
# -----------------------------------------------------------------------------
# File:
# publish_functionapp.sh
#
# Authors:
# * Martin Vuelta <zodiacfireworks@softbutterfly.io>
# * SoftButterfly Dev Team <dev@softbutterfly.io>
#
# Description:
# This script will publish the function app.
#
# Usage:
# ./publish_functionapp.sh \
#     $project_name \
#     $function_app_runtime \
#     $resource_group_name
#
# Parameters:
# * $project_name         : Name of the project.
# * $function_app_runtime : Runtime of the function app.
# * $resource_group_name  : Name of the resource group.
#
# Example:
# ./publish_functionapp.sh \
#     myProject \
#     java \
#     myResourceGroup
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# Preamble:
# ---------

# Global variables
DEFAULT_LOCATION="eastus"

# -----------------------------------------------------------------------------
# Input validation:
# -----------------

# Check if project name is provided
if [ -z "$1" ]; then
    echo "[ERR] Project name is not provided."
    exit 1
else
    PROJECT_NAME="$1"
    FUNCTION_APP_NAME="fn-${PROJECT_NAME}"
fi

# Check if function runtime is provided
if [ -z "$2" ]; then
    echo "[ERR] Function runtime is not provided."
    exit 1
else
    function_app_runtime="$2"
fi

# Check if resource group name is provided
if [ -z "$3" ]; then
    echo "[ERR] Resource group name is not provided."
    exit 1
else
    RESOURCE_GROUP_NAME="$3"
fi

# -----------------------------------------------------------------------------
# Execution:
# ----------

# Publish function app
if [ "${function_app_runtime}" == "java" ]; then
    # Publish function app
    cd "${PROJECT_NAME}"

    mvn clean package

    mvn azure-functions:deploy -DresourceGroup="${RESOURCE_GROUP_NAME}"
elif [ "${function_app_runtime}" == "node" ]; then
    # Publish function app
    cd "${PROJECT_NAME}"

    func azure functionapp publish "${FUNCTION_APP_NAME}"
else
    echo "[ERR] Unsupported function runtime '${function_app_runtime}'."
    exit 1
fi

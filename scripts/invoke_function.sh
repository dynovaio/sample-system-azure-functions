#! /bin/bash
# -----------------------------------------------------------------------------
# File:
# invoke_function.sh
#
# Authors:
# * Martin Vuelta <zodiacfireworks@softbutterfly.io>
# * SoftButterfly Dev Team <dev@softbutterfly.io>
#
# Description:
# This script will invoke the function app.
#
# Usage:
# ./invoke_function.sh \
#     $project_name \
#     $function_name \
#     $resource_group_name \
#     $execution_times \
#     $execution_interval
#
# Parameters:
# * $project_name        : Name of the project.
# * $function_name       : Name of the function.
# * $resource_group_name : Name of the resource group.
# * $execution_times     : Number of times to execute the function.
# * $execution_interval  : Interval between executions.
#
# Example:
# ./invoke_function.sh \
#     myProject \
#     myFunction \
#     myResourceGroup \
#     10 \
#     1
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# Preamble:
# ---------

# Global variables
DEFAULT_EXECUTION_TIMES=10
DEFAULT_EXECUTION_INTERVAL=1

# -----------------------------------------------------------------------------
# Input validation:
# -----------------

# Check if project name is provided
if [ -z "$1" ]; then
    echo "[ERR] Project name is not provided."
    exit 1
else
    PROJECT_NAME="$1"
fi

# Check if function name is provided
if [ -z "$2" ]; then
    echo "[ERR] Function name is not provided."
    exit 1
else
    FUNCTION_NAME="$2"
fi

# Check if resource group name is provided
if [ -z "$3" ]; then
    echo "[ERR] Resource group name is not provided."
    exit 1
else
    RESOURCE_GROUP_NAME="$3"
fi

# Check if execution times is provided
if [ -z "$4" ]; then
    echo "[WARN] Execution times is not provided."
    EXECUTION_TIMES="${DEFAULT_EXECUTION_TIMES}"
else
    EXECUTION_TIMES="$4"
fi

# Check if execution interval is provided
if [ -z "$5" ]; then
    echo "[WARN] Execution interval is not provided."
    EXECUTION_INTERVAL="${DEFAULT_EXECUTION_INTERVAL}"
else
    EXECUTION_INTERVAL="$5"
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

# Get Function App URL
FUNCTION_APP_NAME="fn-${PROJECT_NAME}-${RANDOM_SUFFIX}"

FUNCTION_APP_URL=$(
    az functionapp function show \
        --name "${FUNCTION_APP_NAME}" \
        --resource-group "${RESOURCE_GROUP_NAME}" \
        --function-name "${FUNCTION_NAME}" \
        --query "invokeUrlTemplate" \
        --output tsv
)

# Invoke function
for i in `seq 1 ${EXECUTION_TIMES}`; do
    echo "[INFO] Invoking function '${FUNCTION_NAME}' (${i}/${EXECUTION_TIMES})..."
    curl \
        --request GET \
        --url "${FUNCTION_APP_URL}?name=Azure" \
        --header "Content-Type: application/json";
    echo "";
    sleep ${EXECUTION_INTERVAL}
done

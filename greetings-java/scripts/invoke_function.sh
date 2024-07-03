# /bin/bash
# Call a function multiple times every given seconds

# Usage:
# ./call_function.sh [execution_times] [execution_pause]

# Parameters:
# - execution_times: Number of executions
# - execution_pause: Pause between executions

# Number of executions
execution_times=$1
execution_times=${execution_times:-10}

# Pause between executions
execution_pause=$2
execution_pause=${execution_pause:-1}

# Global variables
RESOURCE_GROUP_NAME="rg-observability-demo"

# Create a function app
FUNCTION_APP_NAME="fn-greetings-java"
FUNCTION_NAME="fngreetingsjava"

FUNTION_INVOKE_URL=$(
    az functionapp function show \
        --resource-group "${RESOURCE_GROUP_NAME}" \
        --name "${FUNCTION_APP_NAME}" \
        --function-name "${FUNCTION_NAME}" \
        --query "invokeUrlTemplate" \
        --output tsv
)

# Call the function
for i in `seq 1 $execution_times`; do
    curl \
        --request POST \
        --url "${FUNTION_INVOKE_URL}"?name=Azure \
        --header "Content-Type: application/json";
    echo "";
    sleep $execution_pause;
done

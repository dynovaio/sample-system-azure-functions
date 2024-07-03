# /bin/bash
# Publish a simple azure function app

# Usage:
# ./publish_function.sh

# Create a function app
FUNCTION_APP_NAME="fn-greetings-java"

func azure functionapp publish "${FUNCTION_APP_NAME}"

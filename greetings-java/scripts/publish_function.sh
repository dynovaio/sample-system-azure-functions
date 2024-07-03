# /bin/bash
# Publish a simple azure function app

# Usage:
# ./publish_function.sh

# Create a function app
FUNCTION_APP_NAME="fn-greetings-java"

mvn clean package

mvn azure-functions:deploy

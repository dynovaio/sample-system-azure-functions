# /bin/bash
# Craete resource group

# Usage:
# ./create_resourcegroup.sh

# Global variables
LOCATION="eastus"

# Create a resource group
RESOURCE_GROUP_NAME="rg-observability-demo"

# Check if the resource group already exists
az group show --name "${RESOURCE_GROUP_NAME}" &>/dev/null

if [ $? -eq 0 ]; then
    echo "Resource group '${RESOURCE_GROUP_NAME}' already exists"
    exit 1
fi

# If the resource group does not exist, create it
az group create \
    --name "${RESOURCE_GROUP_NAME}" \
    --location "${LOCATION}"

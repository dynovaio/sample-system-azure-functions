![Dynova](https://gitlab.com/softbutterfly/open-source/open-source-office/-/raw/master/assets/dynova/dynova-header-1.png)

# Azure Function App Sample: TypeScript with `@azure/functions@v3`

This repository contains a sample Azure Function written in TypeScript that
demonstrates how to implement the New Relic APM agent for TypeScript within
an Azure Function App.

## Requirements

### Recommended Tools

* nvm ([↗][href:nvm])
* docker ([↗][href:docker])
* docker-compose ([↗][href:docker-compose])
* Azure Functions Core Tools ([↗][href:azfct])
* Visual Studio Code ([VSCode ↗][href:vscode]) with the Azure Functions
  extension.

### Required Tools

* Node JS 18+

## Local developement

To run the sample locally, follow these steps:

1. Clone this repository to your local machine.

2. Open a terminal and navigate to the `sample-typescript@azure-functions@v3`
    directory.

3. Copy the `.env.template` file to `.env.db` and update the values of the
    variables according to your requirements.

   ```bash
   cp .env.template .env.db
   ```

4. Run the `docker compose` command to start the database service.

   ```bash
   docker compose \
       -f docker-compose.yml \
       up -d
   ```

5. Copy the `template.settings.json` file to `local.settings.json` and update
    the values of the variables according to your requirements.

   ```bash
   cp template.settings.json local.settings.json
   ```


6. Install the required tools. Assuming you have `nvm` installed, you can
    install node 18 by running the following commands:

   ```bash
   nvm install $(cat .nvmrc)
   ```

7. Run for local development

   ```bash
   nvm use $(cat .nvmrc)

   npm run start
   ```

8. Open a browser and navigate to
    `http://localhost:7071/api/fnsamplebase`.

9. Test the function by sending a request to the endpoint.

    ```bash
    for i in `seq 1 10`; do
        curl \
            --request GET \
            --url "http://localhost:7071/api/fnsamplebase?id=$(($i % 10))" \
            --header 'Content-Type: application/json';
        echo "";
        sleep 1;
    done
    ```

10. Check the logs in the terminal to see the output of the function.

11. To stop the function, press `Ctrl+C` in the terminal.

## Deploy to Azure

To deploy the sample to Azure, follow these steps:

1. Navigate to the `scripts` directory in the root of the repository.

2. Run the following command to create a resource group:

    ```bash
    # Do not modify the values of the variables
    project_name="sample-typescript@azure-functions@v3"
    function_app_runtime="node"
    function_app_runtime_version="20"

    # Modify the values of the variables according to your requirements
    location="eastus"
    resource_group_name="my-resource-group"
    new_relic_license_key="YOUR_NEW_RELIC_LICENSE_KEY"

    # Execute the scripts as follows
    ./scripts/create_resourcegroup.sh \
        $resource_group_name \
        $location

    ./scripts/create_functionapp.sh \
        $project_name \
        $function_app_runtime \
        $function_app_runtime_version \
        $resource_group_name \
        $location

    ./scripts/configure_functionapp.sh \
        $project_name \
        $function_app_runtime \
        $resource_group_name \
        $new_relic_license_key

    ./scripts/publish_functionapp.sh \
        $project_name \
        $function_app_runtime \
        $resource_group_name

    # Launch docker dabase service
    docker-compose \
        -f sample-typescript@azure-functions@v3/docker-compose.ym \
        up -d

    # Function execution parameters
    execution_times=10
    execution_interval=1

    # Select the function you want to invoke
    function_name="fnsamplebase"

    ./scripts/invoke_function.sh \
        $project_name \
        $function_name \
        $resource_group_name \
        $execution_times \
        $execution_interval
    ```


[href:nvm]: https://github.com/nvm-sh/nvm
[href:docker]: https://docs.docker.com/get-docker/
[href:docker-compose]: https://docs.docker.com/compose/install/
[href:azfct]: https://github.com/Azure/azure-functions-core-tools
[href:vscode]: https://code.visualstudio.com

![Dynova](https://gitlab.com/softbutterfly/open-source/open-source-office/-/raw/master/assets/dynova/dynova-header-1.png)

# Azure Function App Sample: Java

This repository contains a sample Azure Function written in Java that
demonstrates how to implement the New Relic APM agent for Java within an Azure
Function App.

## Requirements

### Recommended Tools

* sdkman ([↗][href:sdkman])
* Azure Functions Core Tools ([↗][href:azfct])
* Visual Studio Code ([VSCode ↗][href:vscode]) with the Azure Functions
  extension.

### Required Tools

* Java 17
* Maven 3.9

## Local developement

To run the sample locally, follow these steps:

1. Clone this repository to your local machine.

2. Open a terminal and navigate to the `sample-java` directory.

3. Copy the `template.settings.json` file to `local.settings.json` and update
    the values of the variables according to your requirements.

   ```bash
   cp template.settings.json local.settings.json
   ```

3. Install the required tools. Assuming you have `sdkman` installed, you can
    install Java 17 and Maven 3.9 by running the following commands:

   ```bash
   sdk install java 17.0.11-tem
   sdk install maven 3.9.8
   ```

4. Run for local development

   ```bash
   sdk use java 17.0.11-tem
   sdk use maven 3.9.8

   mvn azure-functions:run
   ```

5. Open a browser and navigate to `http://localhost:7071/api/fnsamplejava`.

6. Test the function by sending a request to the endpoint.

   ```bash
   for i in `seq 1 10`; do
       curl \
           --request GET \
           --url http://localhost:7071/api/fnsamplejava?name=Azure \
           --header 'Content-Type: application/json';
       echo "";
       sleep 1;
   done
   ```

7. Check the logs in the terminal to see the output of the function.

8. To stop the function, press `Ctrl+C` in the terminal.

## Deploy to Azure

To deploy the sample to Azure, follow these steps:

1. Navigate to the `scripts` directory in the root of the repository.

2. Run the following command to create a resource group:

    ```bash
    # Do not modify the values of the variables
    project_name="sample-java"
    function_name="fnsamplejava"
    function_app_runtime="java"
    function_app_runtime_version="17"

    # Modify the values of the variables according to your requirements
    location="eastus"
    resource_group_name="my-resource-group"
    new_relic_license_key="YOUR_NEW_RELIC_LICENSE_KEY"
    execution_times=10
    execution_interval=1

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

    ./scripts/invoke_function.sh \
        $project_name \
        $function_name \
        $resource_group_name \
        $execution_times \
        $execution_interval
    ```

## How to instrument your own Azure Function

To instrument your own Azure Function with the New Relic APM agent for Java,
follow these steps:

1. Add the New Relic APM agent for Java to your project. You can do this by
    adding the following dependency to your `pom.xml` file:

    ```xml
    <dependency>
        <groupId>com.newrelic.agent.java</groupId>
        <artifactId>newrelic-agent</artifactId>
        <version>${NEW_RELIC_AGENT_VERSION}</version>
        <scope>compile</scope>
    </dependency>

    <dependency>
        <groupId>com.newrelic.agent.java</groupId>
        <artifactId>newrelic-api</artifactId>
        <version>${NEW_RELIC_AGENT_VERSION}</version>
        <scope>compile</scope>
    </dependency>
    ```

    Do not forget to replace `${NEW_RELIC_AGENT_VERSION}` with the version of
    the New Relic APM agent for Java that you want to use.

2. In your code add the following import statements:

    ```java
    import com.newrelic.api.agent.NewRelic;
    import com.newrelic.api.agent.Trace;
    ```

3. Add the following code to the method that you want to instrument:

    ```java
    @Trace(dispatcher = true)
    @FunctionName("my-function-name")
    public HttpResponseMessage run(
        @HttpTrigger(
            name = "req",
            methods = {HttpMethod.GET},
            authLevel = AuthorizationLevel.ANONYMOUS)
        HttpRequestMessage<Optional<String>> request,
        final ExecutionContext context
    ) {
        NewRelic.setTransactionName("MyTransactionType", "/my-function-path");

        // Your code here
    }
    ```

4. Configure the New Relic APM agent for Java by adding the following
    configuration to the `local.settings.json` file.

    ```json
    {
        "IsEncrypted": false,
        "Values": {
            "NEW_RELIC_LICENSE_KEY": "your_new_relic_license_key",
            "NEW_RELIC_APP_NAME": "your_app_name",
            "NEW_RELIC_AGENT_ENABLED": "true",
            "NEW_RELIC_LOG_LEVEL": "info",
            "NEW_RELIC_LOG_ENABLED": "true",
            "NEW_RELIC_LOG_FILE_NAME": "stdout",
            "NEW_RELIC_DISTIBUTED_TRACING_ENABLED": "true",
            "NEW_RELIC_APPLICATION_LOGGING_ENABLED": "true",
            "NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED": "false",
            "NEW_RELIC_APPLICATION_LOGGING_LOCAL_DECORATING_ENABLED": "true",
            "WEBSITE_USE_PLACEHOLDER": "0",
            "JAVA_OPTS": "-javaagent:/home/site/wwwroot/lib/newrelic-agent-${NEW_RELIC_AGENT_VERSION}.jar",
            "languageWorkers__java__arguments": "-javaagent:/home/site/wwwroot/lib/newrelic-agent-${NEW_RELIC_AGENT_VERSION}.jar"
        }
    }
    ```

    This variables should be added to your Azure Function App configuration as
    environment variables. You can do this by running the following command:

    ```bash
    az functionapp config appsettings set \
        --name $project_name \
        --resource-group $resource_group_name \
        --settings \
            "NEW_RELIC_LICENSE_KEY=your_new_relic_license_key" \
            "NEW_RELIC_APP_NAME=your_app_name" \
            "NEW_RELIC_AGENT_ENABLED=true" \
            "NEW_RELIC_LOG_LEVEL=info" \
            "NEW_RELIC_LOG_ENABLED=true" \
            "NEW_RELIC_LOG_FILE_NAME=stdout" \
            "NEW_RELIC_DISTIBUTED_TRACING_ENABLED=true" \
            "NEW_RELIC_APPLICATION_LOGGING_ENABLED=true" \
            "NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED=false" \
            "NEW_RELIC_APPLICATION_LOGGING_LOCAL_DECORATING_ENABLED=true" \
            "WEBSITE_USE_PLACEHOLDER=0" \
            "JAVA_OPTS=-javaagent:/home/site/wwwroot/lib/newrelic-agent-${NEW_RELIC_AGENT_VERSION}.jar" \
            "languageWorkers__java__arguments=-javaagent:/home/site/wwwroot/lib/newrelic-agent-${NEW_RELIC_AGENT_VERSION}.jar" \
            "JAVA_OPTS=-javaagent:/home/site/wwwroot/lib/newrelic-agent-${NEW_RELIC_AGENT_VERSION}.jar"
    ```

    Do not forget to replace `your_new_relic_license_key`, `your_app_name`, and
    `${NEW_RELIC_AGENT_VERSION}` with proper values.

    Keep in mind that the `JAVA_OPTS` and `languageWorkers__java__arguments` are
    environment variables that are used to configure the JVM arguments. The
    `languageWorkers__java__arguments` should be used when your function is on
    Consumption Plan, while the `JAVA_OPTS` environment variable should be used
    when your function is on Premium Plan. Check the
    [Azure Functions Java developer guide ↗][href:azfnguide] for more
    information.

[href:sdkman]: https://sdkman.io/
[href:azfct]: https://github.com/Azure/azure-functions-core-tools
[href:vscode]: https://code.visualstudio.com
[href:azfnguide]: https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-java

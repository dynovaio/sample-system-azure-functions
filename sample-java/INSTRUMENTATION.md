![Dynova](https://gitlab.com/softbutterfly/open-source/open-source-office/-/raw/master/assets/dynova/dynova-header-1.png)

# How to instrument your Azure Function App Java with the New Relic APM agent for Java

To instrument your own Azure Function App Java with the New Relic APM agent for Java,
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

[href:azfnguide]: https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-java

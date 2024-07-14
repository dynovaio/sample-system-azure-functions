package io.softbutterfly;

import java.util.Map;
import java.util.Optional;
import java.util.List;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import com.newrelic.api.agent.Trace;
import com.newrelic.api.agent.NewRelic;
import com.newrelic.api.agent.Config;

/**
 * Azure Functions with HTTP Trigger.
 */
public class Function {
    /**
     * This function listens at endpoint "/api/fnsamplejava". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/fnsamplejava
     * 2. curl "{your host}/api/fnsamplejava?name=HTTP%20Query"
     */
    @Trace(dispatcher = true)
    @FunctionName("fnsamplejava")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET, HttpMethod.POST},
                authLevel = AuthorizationLevel.ANONYMOUS)
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) throws IOException {
        context.getLogger().info("Java HTTP trigger processed a request.");
        NewRelic.setTransactionName("Function", "/fnsamplejava");

        // Parse query parameter
        final String query = request.getQueryParameters().get("name");
        final String name = request.getBody().orElse(query);

        logJVMArguments(context);
        logRuntimeEnvironment(context);
        logNewRelicSettings(context);

        HttpResponseMessage response = null;

        if (name == null) {
            response = request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass a name on the query string or in the request body").build();
        } else {
            response = request.createResponseBuilder(HttpStatus.OK).body("Hello, " + name).build();
        }

        return response;
    }

    void logJVMArguments(ExecutionContext context) {
        RuntimeMXBean runtimeMxBean = ManagementFactory.getRuntimeMXBean();
        List<String> arguments = runtimeMxBean.getInputArguments();

        context.getLogger().info("JVM Arguments");

        for (String argument : arguments) {
            context.getLogger().info("Argument: " + argument);
        }
    }

    void logRuntimeEnvironment(ExecutionContext context) throws IOException  {
        final String executionPath =  System.getProperty("user.dir");
        final String executionPathMessage = String.format("Execution path: %s", executionPath);
        context.getLogger().info(executionPathMessage);

        // Expore path /home/site/wwwroot
        final Path aboslutePath = Paths.get("/home/site/wwwroot/");

        if (Files.exists(aboslutePath)) {
            final String aboslutePathMessage = String.format("Exploration path: %s", aboslutePath.toString());
            context.getLogger().info(aboslutePathMessage);

            try (Stream<Path> paths = Files.walk(aboslutePath)) {
                paths.forEach(filePath -> {
                    final String filePathMessage = String.format("File path: %s", filePath);
                    context.getLogger().info(filePathMessage);
                });
            }
        }
    }

    void logNewRelicSettings(ExecutionContext context) {
        Config config = NewRelic.getAgent().getConfig();
        String app_name = config.getValue("newrelic.config.app_name");
        String license_key = config.getValue("newrelic.config.license_key");

        context.getLogger().info("New Relic Settings");
        context.getLogger().info("App Name: " + app_name);
        context.getLogger().info("License Key: " + license_key);
    }
}

package io.softbutterfly.greetings;

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
     * This function listens at endpoint "/api/HttpExample". Two ways to invoke it
     * using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/HttpExample
     * 2. curl "{your host}/api/HttpExample?name=HTTP%20Query"
     */
    @Trace(dispatcher = true)
    @FunctionName("fngreetingsjava")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = { HttpMethod.GET,
                    HttpMethod.POST }, authLevel = AuthorizationLevel.ANONYMOUS) HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) throws IOException {
        context.getLogger().info("Java HTTP trigger processed a request.");

        // Check JVM Arguments
        RuntimeMXBean runtimeMxBean = ManagementFactory.getRuntimeMXBean();
        List<String> arguments = runtimeMxBean.getInputArguments();

        context.getLogger().info("JVM Arguments");

        for (String argument : arguments) {
            context.getLogger().info("Argument: " + argument);
        }

        // Check New Relic settings
        Config config = NewRelic.getAgent().getConfig();
        String licenseKey = config.getValue("newrelic.config.license_key", null);
        String appName = config.getValue("newrelic.config.app_name", null);

        context.getLogger().info("License Key: " + licenseKey);
        context.getLogger().info("App Name: " + appName);

        // Parse query parameter
        final String query = request.getQueryParameters().get("name");
        final String name = request.getBody().orElse(query);

        // Path exploration
        final String executionPath = System.getProperty("user.dir");
        final String executionPathMessage = String.format("Execution path: %s", executionPath);
        context.getLogger().info(executionPathMessage);

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

        // Check JAVA_OPTS environment variable
        final Map<String, String> env = System.getenv();
        final String javaOpts = env.get("JAVA_OPTS");
        final String javaOptsMessage = String.format("JAVA_OPTS: %s", javaOpts);
        context.getLogger().info(javaOptsMessage);

        if (name == null) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Please pass a name on the query string or in the request body").build();
        } else {
            return request.createResponseBuilder(HttpStatus.OK).body("Hello, " + name).build();
        }
    }
}

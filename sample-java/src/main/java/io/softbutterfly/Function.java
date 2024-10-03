package io.softbutterfly;

import java.util.Map;
import java.util.Optional;
import java.util.List;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;
import java.util.Enumeration;

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
import com.newrelic.api.agent.Request;
import com.newrelic.api.agent.Response;
import com.newrelic.api.agent.HeaderType;
import com.newrelic.api.agent.Headers;
import com.newrelic.api.agent.ConcurrentHashMapHeaders;
import com.newrelic.api.agent.TransportType;



/**
 * Azure Functions with HTTP Trigger.
 */
public class Function {
    /**
     * This function listens at endpoint "/api/fnsamplebase". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/fnsamplebase
     * 2. curl "{your host}/api/fnsamplebase?name=HTTP%20Query"
     */
    @Trace(dispatcher = true)
    @FunctionName("fnsamplebase")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET, HttpMethod.POST},
                authLevel = AuthorizationLevel.ANONYMOUS)
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) throws IOException {
        context.getLogger().info("Java HTTP function was started.");
        NewRelic.setTransactionName("Function", "/fnsamplebase");
        setupDistributedTracing(request);

        // Parse query parameter
        final String query = request.getQueryParameters().get("name");
        final String name = request.getBody().orElse(query);

        HttpResponseMessage response = null;

        if (name == null) {
            response = request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass a name on the query string or in the request body").build();
            context.getLogger().error("Java HTTP function has finished with errors.");
        } else {
            response = request.createResponseBuilder(HttpStatus.OK).body("Hello, " + name).build();
            context.getLogger().info("Java HTTP function has finished successfully.");
        }
        setupTransactionRequestAdnResponse(request, response);
        return response;
    }

    void setupDistributedTracing(HttpRequestMessage<Optional<String>> request) {
        final String traceParent = request.getHeaders().get("traceparent");
        final String traceState = request.getHeaders().get("tracestate");

        if (traceParent != null) {
            Headers headers = ConcurrentHashMapHeaders.build(HeaderType.HTTP);
            headers.setHeader("traceparent", traceParent);
            headers.setHeader("tracestate", traceState);

            NewRelic.getAgent().getTransaction().acceptDistributedTraceHeaders(TransportType.HTTP, headers);
        }
    }

    void setupTransactionRequestAdnResponse(HttpRequestMessage request, HttpResponseMessage response) {
        Request nrRequest = new RequestWrapper(request);
        Response nrResponse = new ResponseWrapper(response);
        NewRelic.setRequestAndResponse(nrRequest, nrResponse);
    }

    public static class ResponseWrapper implements Response  {
        private final HttpResponseMessage response;

        public ResponseWrapper(HttpResponseMessage response) {
            this.response = response;
        }

        @Override
        public String getContentType() {
            return response.getHeader("Content-Type");
        }

        @Override
        public String getStatusMessage() {
            return String.format("%d", response.getStatusCode());
        }

        @Override
        public int getStatus() {
            return response.getStatusCode();
        }

        @Override
        public HeaderType getHeaderType() {
            return HeaderType.HTTP;
        }

        @Override
        public void setHeader(String name, String value) {}
    }

    public static class RequestWrapper implements Request {
        private final HttpRequestMessage request;

        public RequestWrapper(HttpRequestMessage request) {
            this.request = request;
        }

        @Override
        public HeaderType getHeaderType() {
            return HeaderType.HTTP;
        }

        @Override
        public String getCookieValue(String name) {
            return null;
        }

        @Override
        public Object getAttribute(String name) {
            return null;
        }

        @Override
        public String[] getParameterValues(String name) {
            return new String[0];
        }

        @Override
        public Enumeration getParameterNames() {
            return null;
        }

        @Override
        public String getRemoteUser() {
            return null;
        }

        @Override
        public String getRequestURI() {
            return null;
        }

        @Override
        public String getHeader(String name) {
            return null;
        }
    }
}

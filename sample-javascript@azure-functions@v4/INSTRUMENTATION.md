![Dynova](https://gitlab.com/softbutterfly/open-source/open-source-office/-/raw/master/assets/dynova/dynova-header-1.png)

# How to instrument your Azure Function with the New Relic APM agent for Node

I this guide you will learn how to implement the New Relic APM agent in an Azure Function App written in JavaScript.

## Instrumentation

To keep the things in order we have created a module called `observability`
in the the `src/shared` directory. This module will be responsible for the
initialization of the New Relic APM agent and contains some basic wrappers
for transaction, error handling and instrumentation.

Before to follow the steps below, make sure you have the New Relic APM agent
installed in your project. To install the New Relic APM agent, you can use the
following command:

```bash
npm install newrelic
```

### Basic transaction recording

For basic usage, you can register a transaction using the `wrapAsWebTransaction`
function. This function will wrap your function handler and record a transaction
in the New Relic APM agent.

The following example shows how the `wrapAsWebTransaction` is used in the
`src/functions/fnsamplebase.js` file:

```javascript
const { wrapAsWebTransaction } = require('../shared/observability');

// ... your other imports

const handler = async (context, req) => {
    // ... your function code here
};

app.http('fnsamplebase', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplebase', handler),
});
```

### Logs in context

The log in context is a feature that allows you to correlate logs with the
distributed traces in the New Relic APM agent. To use this feature, you need
can use many metods depending on the library you are using.

Keep in mind that to fully enable the logs in context feature, you need to
stream your logs to New Relic. To do this, check the repository of the
[NewRelic log forawrder ↗][href:dynovanrlogforwarder] project from
[Dynova ↗][href:dynova].

#### Using the InvocationContext logger

The `InvocationContext` class from '@azure/functions' package provides a
logger. In order to add the New Relic enrichments logs you need to use the
`instrument`function from `observability/instrumentations/azure-functions`
module.

The following example shows how the `instrument` is used in the
`src/functions/fnsamplecontextlogs.js` file:

```javascript
const newrelic = require('newrelic');
const { wrapAsWebTransaction } = require('../shared/observability');
const { azureFunctionsInstrumentation } = require('../shared/observability/instrumentations');
newrelic.instrument('@azure/functions', azureFunctionsInstrumentation);

// ... your other imports

const handler = async (context, req) => {
    context.log(`Http function processed request for url "${request.url}"`)
    context.trace(`Http function processed request for url "${request.url}"`)
    context.debug(`Http function processed request for url "${request.url}"`)
    context.info(`Http function processed request for url "${request.url}"`)
    context.error(`Http function processed request for url "${request.url}"`)
    context.warn(`Http function processed request for url "${request.url}"`)

    // ... your function code here
};

app.http('fnsamplecontextlogs', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplecontextlogs', handler),
});
```

#### Using the winston logger

The winsotn logger is a popular logger for Node.js applications. If you are
using the winston logger with versions greater than 3.0.0, the newrelic agent
supports the winston logger out of the box since agent version 8.11.0.

Check the New Relic compatibility requirements for the Node.js agent
([↗][href:nodecompat]).

#### Using the pino logger

The pino logger is a fast logger for Node.js applications. If you are using the
pino logger. If you are using the pino logger with versions greater than 7.0.0,
the newrelic agent supports the pino logger out of the box since agent version
8.11.0.

Check the New Relic compatibility requirements for the Node.js agent
([↗][href:nodecompat]).

#### What about `console.log`?

If you are using the `console.log` function to log messages, you can use the
`getNRLinkingMetadata`function from the New Relic Agent API to add the New Relic
enrichments to the log messages.

Look at `fnsamplelogconsole.js` for an example.

```javascript
const newrelic = require('newrelic');

// ... your other imports

const handler = async (context, req) => {
    console.log(
        'Http function processed request for url "${request.url}"',
        newrelic.getNRLinkingMetadata()
    );

    // ... your function code here
};

app.http('fnsamplelogconsole', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplelogconsole', handler),
});
```


[href:dynova]: https://dynova.io
[href:dynovanrlogforwarder]: https://github.com/dynovaio/newrelic-logforwarder
[href:nodecompat]: https://docs.newrelic.com/docs/apm/agents/nodejs-agent/getting-started/compatibility-requirements-nodejs-agent/#instrumented-modules

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

const handler = async (context, req) => {
    // Your function code here
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

const handler = async (context, req) => {
    context.log(`Http function processed request for url "${request.url}"`)
    context.trace(`Http function processed request for url "${request.url}"`)
    context.debug(`Http function processed request for url "${request.url}"`)
    context.info(`Http function processed request for url "${request.url}"`)
    context.error(`Http function processed request for url "${request.url}"`)
    context.warn(`Http function processed request for url "${request.url}"`)

    // Your function code here
};

app.http('fnsamplecontextlogs', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplecontextlogs', handler),
});
```

#### Using the winston logger

To be done

#### Using the pino logger

To be done


#### What about `console.log`?

To be done

### Sotrage and segments

To be done

![Dynova](https://gitlab.com/softbutterfly/open-source/open-source-office/-/raw/master/assets/dynova/dynova-header-1.png)

# How to instrument your Azure Function App TypeScrip with the New Relic APM agent for Node

In this guide you will learn how to implement the New Relic APM agent in an Azure Function App written in JavaScript.

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
npm install --save-dev @types/newrelic
```

### Allow use of the `observability` module

To use the `observability` module within your Azure Function App written in
TypeScript, you need to add the following import statement to your
`tsconfig.json` file

```json
{
  "compilerOptions": {
    // ... your other options
    "allowJs": true
  }
}

```

### Record transactions: Wrap your function handler

The `observability` module contains a utility functions to wrap your function handler and register it as a transaction in the New Relic APM agent.

To use the `wrapAsWebTransaction` function, you need to import it from the
`observability` module. The following example shows how the
`fnsamplebase/index.js` file:

```typescript
import * as newrelic from 'newrelic';

// ... instrumentation code goes here

import { wrapAsWebTransaction } from '../shared/observability';

// ... your other imports

class HttpTrigger {
    static function = wrapAsWebTransaction('fnsamplebase', HttpTrigger.handler)

    static async handler(context: Context, req: HttpRequest): Promise<void> {
        // ... your function code here
    }
}

export default HttpTrigger.function
```

The above code will allow you to register the `HttpTrigger.handler` function as
a transaction in the New Relic APM agent under the name `/fnsamplebase`.

If we want to register spans as part of the transaction, we can use the
`wrapAsSegment` function. This function will create a segment in the
transaction and will show the span in the Distributed tracing view in
New Relic.

To use the `wrapAsSegment` function, you can follow the example below,
which shows how the `fnsamplebase/index.js` file:

```typescript
import * as newrelic from 'newrelic';

// ... instrumentation code goes here

import { wrapAsSegment } from '../shared/observability';

// ... your other imports

class HttpTrigger {
    static function = wrapAsSegment('fnsamplebase', HttpTrigger.handler)

    static async handler(context: Context, req: HttpRequest): Promise<void> {
        // ... your function code here

        try {
            if (req.method === 'GET') {
                return await wrapAsSegment('HttpTrigger/getUser', HttpTrigger.getUser)(context, req)
            } if (req.method === 'POST') {
                return await wrapAsSegment('HttpTrigger/createUser', HttpTrigger.createUser)(context, req)
            }
            context.res = {
                status: 405,
                body: 'Method Not Allowed'
            }
        } catych (error) {
            context.res = {
                status: 500,
                body: 'Internal Server Error'
            }

            throw error
        }
    }

    static async getUser(context: Context, req: HttpRequest): Promise<void> {
        // ... your function code here
    }

    static async createUser(context: Context, req: HttpRequest): Promise<void> {
        // ... your function code here
    }
}

export default HttpTrigger.function
```

The above code will allow you to register the `HttpTrigger.getUser` and
`HttpTrigger.createUser` functions as segments in the transaction in the New
Relic APM agent under the names `HttpTrigger/getUser` and
`HttpTrigger/createUser`, respectively.

You can also se exmaples of how to use the `wrapAsSegment` function in the
database operations in the `shared/database/index.js` file.

### Deeper Distributed tracing: Instrument Data Store

Yo can get deeper insights into your database operations by instrumenting
the module that you are using to interact with the database. If the module
is not supported by the New Relic APM agent, you can create a wrapper that
instruments the database operations.

In this exmaple, for database operation, we are using in this example the
`knex` package. This package is currently not supported by the New Relic APM
agent. To instrument the database operations, we have created a module called
`instrumentations/knex.js` in the `shared/observability` directory. This
module contains a function that wraps the `knex.Client` class and instruments
the database operations.

The following example shows how the `instrument` function is used in the
`fnsamplebase/index.js` file:

```typescript
import * as newrelic from 'newrelic';

import { azureFunctionsInstrumentation, knexInstrumentation } from "../shared/observability/instrumentations"

newrelic.instrumentDatastore({
    moduleName: 'knex',
    onRequire: knexInstrumentation.instrument
})

// ... your code here
```

With this lines, the operation `acquireConnection`, `releaseConnection` and
`query` will be instrumented by the New Relic APM agent and wil be shown in
the Distributed tracing view in New Relic.

### Logs In context: Instrument Azure Functions

The `observability` module contains a module called
`instrumentations/azure-functions.js` in the directory `shared/observability`.
This module contains a function that patches the logging methods of the
`InvocationContext` class from the `@azure/functions` package.

The logging methods from the `InvocationContext` class defined on the fly in
the constructor of the `InvocationContext` class and are not available in the
prototype of the class. To instrument the logging methods, we need to patch
those methos directly in the `InvocationContext` instance with is passed as
argument to the function handler.

The following example shows how the `patchAzureContext` function is used in the
`fnsamplebase/index.js` file:

```typescript
import * as newrelic from 'newrelic';

import { azureFunctionsInstrumentation, knexInstrumentation } from "../shared/observability/instrumentations"

// ... your other imports

class HttpTrigger {
    static async handler(context: Context, req: HttpRequest): Promise<void> {
        context = azureFunctionsInstrumentation.patchAzureContext(context);

        // ... your function code here
    }
}
```


[href:dynova]: https://dynova.io
[href:dynovanrlogforwarder]: https://github.com/dynovaio/newrelic-logforwarder
[href:nodecompat]: https://docs.newrelic.com/docs/apm/agents/nodejs-agent/getting-started/compatibility-requirements-nodejs-agent/#instrumented-modules

const newrelic = require('newrelic');
const { wrapAsWebTransaction } = require('../shared/observability');
const { azureFunctionsInstrumentation } = require('../shared/observability/instrumentations');
newrelic.instrument('@azure/functions', azureFunctionsInstrumentation.instrument);

const { app } = require('@azure/functions');

const handler = async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`)
    context.trace(`Http function processed request for url "${request.url}"`)
    context.debug(`Http function processed request for url "${request.url}"`)
    context.info(`Http function processed request for url "${request.url}"`)
    context.error(`Http function processed request for url "${request.url}"`)
    context.warn(`Http function processed request for url "${request.url}"`)

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
}

app.http('fnsamplecontextlogs', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplecontextlogs', handler)
});

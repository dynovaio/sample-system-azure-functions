const newrelic = require('newrelic');
const { wrapAsyncAsWebTransaction, instrumentAzureFuntionsInvocationContext } = require('../shared/observability');

newrelic.instrument('@azure/functions', instrumentAzureFuntionsInvocationContext);

const { app } = require('@azure/functions');

const handler = async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`)
    context.error(`Http function processed request for url "${request.url}"`)
    context.warn(`Http function processed request for url "${request.url}"`)
    context.warn("Http function processed request for url \"%s\" (using placeholder subtitution)", request.url)

    console.log(
        `Http function processed request for url "${request.url}" (usign manual decoration)`, newrelic.agent.getNRLinkingMetadata()
    )

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
}

app.http('fnsamplejavascript', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wrapAsyncAsWebTransaction('/fnsamplejavascript', handler)
});

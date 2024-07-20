const newrelic = require('newrelic');
const { wrapAsWebTransaction } = require('../shared/observability');

const { app } = require('@azure/functions');

const handler = async (request, context) => {
    console.log(`Http function processed request for url "${request.url}"`, newrelic.agent.getNRLinkingMetadata());

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
}

app.http('fnsamplelogsconsole', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplelogsconsole', handler)
});

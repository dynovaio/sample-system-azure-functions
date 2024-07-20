const { wrapAsWebTransaction } = require('../shared/observability');

const { app } = require('@azure/functions');

const handler = async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`)

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
}

app.http('fnsamplewinstonlogs', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplewinstonlogs', handler)
});

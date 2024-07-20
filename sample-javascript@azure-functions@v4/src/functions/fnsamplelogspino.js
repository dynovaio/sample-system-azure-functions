const { wrapAsWebTransaction } = require('../shared/observability');

const { app } = require('@azure/functions');
const pino = require('pino')

const logger = pino()

const handler = async (request, context) => {
    logger.info(`Http function processed request for url "${request.url}"`)

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
}

app.http('fnsamplelogspino', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplelogspino', handler)
});

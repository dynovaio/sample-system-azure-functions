const { wrapAsWebTransaction } = require('../shared/observability');

const { app } = require('@azure/functions');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {
        function: 'fnsamplelogswinston'
    },
    transports: [
        new winston.transports.Console({
            format: winston.format.json()
        })
    ],
});

const handler = async (request, context) => {
    logger.info(`Http function processed request for url "${request.url}"`)

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
}

app.http('fnsamplelogswinston', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wrapAsWebTransaction('/fnsamplelogswinston', handler)
});

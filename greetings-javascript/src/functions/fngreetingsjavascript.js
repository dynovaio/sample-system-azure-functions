const newrelic = require('newrelic');
const { app } = require('@azure/functions');

const winston = require('winston')
const newrelicFormatter = require('@newrelic/winston-enricher')(winston)

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {
        // Azure Function App Name
        functionName: 'fn-greetings-javascript',
        // Function.{{functionName}}.winston
        category: 'Function.fngreetingsjavascript.winston'
    },
    transports: [
        new winston.transports.Console(
            {
                format: winston.format.combine(
                    winston.format.json(),
                    newrelicFormatter()
                ),
            }
        )
    ],
});

const _handler = async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);
    logger.info(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
}

const handler = async (request, context) => {
    return newrelic.startWebTransaction('fngreetingsjavascript', async () => {
        let transaction = newrelic.getTransaction();
        let response = null;
        try {
            response = await _handler(request, context);
        } catch (error) {
            newrelic.noticeError(error);
            throw error;
        } finally {
            transaction.end();
        }

        return response;
    });
}

app.http('fngreetingsjavascript', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: handler
});

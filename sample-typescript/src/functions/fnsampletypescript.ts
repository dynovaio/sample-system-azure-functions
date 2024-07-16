/* Observability preamble */
import * as newrelic from 'newrelic';
import { wrapAsyncAsWebTransaction, instrumentAzureFuntionsInvocationContext } from '../shared/observability';

newrelic.instrument('@azure/functions', instrumentAzureFuntionsInvocationContext);

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    context.error(`Http function processed request for url "${request.url}"`);
    context.warn(`Http function processed request for url "${request.url}"`);
    context.warn("Http function processed request for url \"%s\" (using placeholder subtitution)", request.url);

    console.log(
        `Http function processed request for url "${request.url}" (usign manual decoration)`, newrelic.agent.getNRLinkingMetadata()
    );

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
};

app.http('fnsampletypescript', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: wrapAsyncAsWebTransaction('/fnsampletypescript', handler)
});

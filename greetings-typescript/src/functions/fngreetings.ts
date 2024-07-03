import newrelic from 'newrelic';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";


export async function fngreetings(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("fngreetings::fngreetings")
    context.log(`Http function processed request for url "${request.url}"`);

    context.log(JSON.stringify(process.execArgv))
    const name = request.query.get('name') || await request.text() || 'world';

    return { body: JSON.stringify({ "message": `Hello, ${name}!`, "nodeArgs": process.execArgv }) };
};


export async function transactionWrapper(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("fngreetings::transactionWrapper");
    const pseudoResponse = newrelic.startWebTransaction('/fngreetings/handler/pseudo', async () => await fngreetings(request, context))
    console.log(pseudoResponse);

    return await fngreetings(request, context);
}


app.http('fngreetings', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: transactionWrapper
});

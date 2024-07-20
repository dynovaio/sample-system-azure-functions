import * as newrelic from 'newrelic';
import { wrapAsWebTransaction, instrumentAzureFuntionsInvocationContext, patchContext } from '../shared/observability';
newrelic.instrument('@azure/functions', instrumentAzureFuntionsInvocationContext);

const azureFunctionsModule = require('@azure/functions');

import { Context, HttpRequest } from "@azure/functions"

class HttpTrigger {
    static function = wrapAsWebTransaction('fnsamplebase', HttpTrigger.handler);

    static async handler(context: Context, req: HttpRequest): Promise<void> {
        console.log(azureFunctionsModule.prototype);
        console.log(azureFunctionsModule.__proto__);
        console.log("----------")
        console.log(typeof context, context.constructor.name, context.constructor.name, context.constructor.toString());
        console.log("----------")
        // context = patchContext(context);

        context.log.error('HTTP trigger function processed a request.');
        context.log.warn('HTTP trigger function processed a request.');
        context.log.info('HTTP trigger function processed a request.');
        context.log.verbose('HTTP trigger function processed a request.');

        const name = (req.query.name || (req.body && req.body.name));
        const responseMessage = name
            ? "Hello, " + name + ". This HTTP triggered function executed successfully."
            : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: responseMessage
        };
    }
}

export default HttpTrigger.function;

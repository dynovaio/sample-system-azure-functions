import * as newrelic from 'newrelic'

import { azureFunctionsInstrumentation, knexInstrumentation } from "../shared/observability/instrumentations"
newrelic.instrumentDatastore({
    moduleName: 'knex',
    onRequire: knexInstrumentation.instrument
})

import { wrapAsWebTransaction, wrapAsSegment } from "../shared/observability"

import { getUser, createUser } from "../shared/database"

import { Context, HttpRequest } from "@azure/functions"

class HttpTrigger {
    static function = wrapAsWebTransaction('fnsamplebase', HttpTrigger.handler)

    static async handler(context: Context, req: HttpRequest): Promise<void> {
        context = azureFunctionsInstrumentation.patchAzureContext(context)

        context.log.info('Context:', context.constructor?.name === 'c');
        context.log.info('Request:', req.constructor?.name === 'c');

        context.log.error('HTTP trigger function processed a request.')
        context.log.warn('HTTP trigger function processed a request.')
        context.log.info('HTTP trigger function processed a request.')
        context.log.verbose('HTTP trigger function processed a request.')

        try {
            if (req.method === 'GET') {
                return await wrapAsSegment('HttpTrigger/getUser', HttpTrigger.getUser)(context, req)
            }

            if (req.method === 'POST') {
                return await wrapAsSegment('HttpTrigger/createUser', HttpTrigger.createUser)(context, req)
            }

            context.res = {
                status: 405,
                body: 'Method not allowed'
            }
        } catch (error) {
            context.log.error('Error processing request', error)
            context.res = {
                status: 500,
                body: 'Internal server error'
            }
            throw error;
        }
    }

    static async createUser(context: Context, req: HttpRequest): Promise<void> {
        const userData = req.body
        const user = await createUser(userData)

        context.res = {
            status: 201,
            body: user
        }
    }

    static async getUser(context: Context, req: HttpRequest): Promise<void> {
        const userId = parseInt(req.query.id)

        if (!userId) {
            context.res = {
                status: 400,
                body: 'User id is required'
            }
            return
        }

        const user = await getUser(userId)

        context.res = {
            status: user ? 200 : 404,
            body: user
        }
    }
}

export default HttpTrigger.function

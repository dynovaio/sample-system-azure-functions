import * as newrelic from 'newrelic';
import { isApplicationLoggingEnabled } from 'newrelic/lib/util/application-logging';

export function wrapAsWebTransaction(url: string, handler: Function) {
    function wrappedHandler() {
        const wrappedArguments = arguments;

        return newrelic.startWebTransaction(url, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler(...wrappedArguments);
            } catch (error) {
                transaction.noticeError(error);
                throw error;
            } finally {
                transaction.end();
            }
        })
    }

    return wrappedHandler;
}

export function wrapAsyncAsWebTransaction(url: string, handler: Function) {
    async function wrappedAsyncHandler() {
        const wrappedArguments = arguments;

        return newrelic.startWebTransaction(url, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler(...wrappedArguments);
            } catch (error) {
                transaction.noticeError(error);
                throw error;
            } finally {
                transaction.end();
            }
        })
    }

    return wrappedAsyncHandler;
}

export function wrapAsBackgroundTransaction(name: string, handler: Function) {
    function wrappedHandler() {
        const wrappedArguments = arguments;

        return newrelic.startBackgroundTransaction(name, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler(...wrappedArguments);
            } catch (error) {
                transaction.noticeError(error);
                throw error;
            } finally {
                transaction.end();
            }
        })
    }

    return wrappedHandler;
}

export function wrapAsyncAsBackgroundTransaction(name: string, handler: Function) {
    async function wrappedAsyncHandler() {
        const wrappedArguments = arguments;

        return newrelic.startBackgroundTransaction(name, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler(...wrappedArguments);
            } catch (error) {
                transaction.noticeError(error);
                throw error;
            } finally {
                transaction.end();
            }
        })
    }

    return wrappedAsyncHandler;
}

export function wrapAsSegment(name: string, handler: Function) {
    function wrappedHandler() {
        const wrappedArguments = arguments;

        return newrelic.startSegment(name, true, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler(...wrappedArguments);
            } catch (error) {
                transaction.noticeError(error);
                throw error;
            }
        })
    }

    return wrappedHandler;
}

export function wrapAsyncAsSegment(name: string, handler: Function) {
    async function wrappedAsyncHandler() {
        const wrappedArguments = arguments;

        return newrelic.startSegment(name, true, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler(...wrappedArguments);
            } catch (error) {
                transaction.noticeError(error);
                throw error;
            }
        })
    }

    return wrappedAsyncHandler;
}

export function instrumentKnex(shim, knex) {
    shim.setDatastore(shim.POSTGRES);

    const clientPrototype = knex.Client.prototype;

    shim.recordOperation(
        clientPrototype,
        ['query'],
        {
            connection: shim.FIRST,
            queryParam: shim.LAST
        }
    );

    shim.recordOperation(
        clientPrototype,
        ['transaction'],
        {
            container: shim.FIRST,
            config: shim.SECOND,
            outerTx: shim.LAST
        }
    );

    shim.recordOperation(
        clientPrototype,
        ['raw'],
        {}
    );

    shim.recordOperation(
        clientPrototype,
        ['validateConnection'],
        {
            connection: shim.FIRST
        }
    );

    shim.recordOperation(
        clientPrototype,
        ['queryCompiler'],
        {
            builder: shim.FIRST,
            formatter: shim.LAST
        }
    );

    shim.recordOperation(
        clientPrototype,
        ['queryBuilder'],
        {}
    );

    shim.recordOperation(
        clientPrototype,
        ['formatter'],
        {
            builder: shim.FIRST
        }
    );

    shim.recordOperation(
        clientPrototype,
        ['runner'],
        {
            builder: shim.FIRST
        }
    );
};

export function instrumentAzureFuntionsInvocationContext(shim: any, azureFunctions: any) {
    const agent = shim.agent
    const config = agent.config

    if (!config?.application_logging?.enabled) {
        console.log('Application logging is not enabled. Skipping instrumentation of Azure Functions invocation context logging.')
        return
    }

    const contextPrototype = azureFunctions.InvocationContext.prototype;
    const logFunctions = ['log', 'trace', 'debug', 'info', 'warn', 'error']

    const hasSubtitutionPlaceHolders = (message: string): boolean => {
        const placeholders = ['%o', '%O', '%d', '%i', '%f', '%s', '%c'];
        return placeholders.some((placeholder) => message.includes(placeholder));
    }

    logFunctions.forEach(function (logFunctionName: string) {
        shim.wrap(
            contextPrototype,
            logFunctionName,
            function wrapLog(shim: any, logFunction: any) {
                return function wrappedLog() {
                    const args = shim.argsToArray.apply(shim, arguments)
                    const newrelicMetadata = newrelic.agent.getNRLinkingMetadata()

                    let [head, ...tail] = args;

                    if (hasSubtitutionPlaceHolders(head)) {
                        head = `${head}${newrelicMetadata}`
                    } else {
                        tail = [...tail, newrelicMetadata]
                    }

                    logFunction.apply(this, [head, ...tail])
                }
            }
        )
    })
}

const newrelic = require('newrelic');

const wrapAsWebTransaction = (url, handler) => {
    const wrappedHandler = (...args) => {
        const wrappedArguments = args;

        return newrelic.startWebTransaction(url, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler.apply(this, wrappedArguments);
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

const wrapAsyncAsWebTransaction = (url, handler) => {
    const wrappedAsyncHandler = async (...args) => {
        const wrappedArguments = args;

        return newrelic.startWebTransaction(url, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler.apply(this, wrappedArguments);
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

const wrapAsBackgroundTransaction = (name, handler) => {
    const wrappedHandler = (...args) => {
        const wrappedArguments = args;

        return newrelic.startBackgroundTransaction(name, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler.apply(this, ...wrappedArguments);
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

const wrapAsyncAsBackgroundTransaction = (name, handler) => {
    const wrappedAsyncHandler = async (...args) => {
        const wrappedArguments = args;

        return newrelic.startBackgroundTransaction(name, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler.apply(this, ...wrappedArguments);
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

const wrapAsSegment = (name, handler) => {
    const wrappedHandler = (...args) => {
        const wrappedArguments = args;

        return newrelic.startSegment(name, true, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler.apply(this, ...wrappedArguments);
            } catch (error) {
                transaction.noticeError(error);
                throw error;
            }
        })
    }

    return wrappedHandler;
}

const wrapAsyncAsSegment = (name, handler) => {
    const wrappedAsyncHandler = async (...args) => {
        const wrappedArguments = args;

        return newrelic.startSegment(name, true, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler.apply(this, ...wrappedArguments);
            } catch (error) {
                transaction.noticeError(error);
                throw error;
            }
        })
    }

    return wrappedAsyncHandler;
}

const instrumentKnex = (shim, knex) => {
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
}

const instrumentAzureFuntionsInvocationContext = (shim, azureFunctions) => {
    const agent = shim.agent
    const config = agent.config

    if (!config?.application_logging?.enabled) {
        console.log('Application logging is not enabled. Skipping instrumentation of Azure Functions invocation context logging.')
        return
    }

    const contextPrototype = azureFunctions.InvocationContext.prototype

    console.log('Instrumenting Azure Functions invocation context logging.')
    console.log(contextPrototype)

    const logFunctions = ['log', 'trace', 'debug', 'info', 'warn', 'error']

    const hasSubtitutionPlaceHolders = (message) => {
        const placeholders = ['%o', '%O', '%d', '%i', '%f', '%s', '%c'];
        return placeholders.some(
            (placeholder) => message.includes(placeholder)
        );
    }

    logFunctions.forEach(
        logFunctionName => {
            shim.wrap(
                contextPrototype,
                logFunctionName,
                (shim, logFunction) => {
                    return function (...args) {
                        const wrappedArguments = shim.argsToArray.apply(shim, args)

                        const newrelicMetadata = newrelic.agent.getNRLinkingMetadata()

                        let [head, ...tail] = wrappedArguments;

                        if (hasSubtitutionPlaceHolders(head)) {
                            head = `${head}${newrelicMetadata}`
                        } else {
                            tail = [...tail, newrelicMetadata]
                        }

                        logFunction.apply(this, [head, ...tail])
                    }
                }
            )
        }
    )
}

module.exports = {
    wrapAsWebTransaction,
    wrapAsyncAsWebTransaction,
    wrapAsBackgroundTransaction,
    wrapAsyncAsBackgroundTransaction,
    wrapAsSegment,
    wrapAsyncAsSegment,
    instrumentKnex,
    instrumentAzureFuntionsInvocationContext
};

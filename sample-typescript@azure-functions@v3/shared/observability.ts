import * as newrelic from 'newrelic';

export function wrapAsWebTransaction(url: string, handler: Function) {
    function wrappedHandler() {
        const wrappedArguments = arguments;

        return newrelic.startWebTransaction(url, async () => {
            let transaction = newrelic.getTransaction();

            try {
                return await handler(...wrappedArguments);
            } catch (error) {
                newrelic.noticeError(error);
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
                newrelic.noticeError(error);
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
                newrelic.noticeError(error);
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
                newrelic.noticeError(error);
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
                newrelic.noticeError(error);
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
                newrelic.noticeError(error);
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
}

export function instrumentAzureFuntionsInvocationContext(shim: any, module: any) {
    console.log(module);
    const agent = shim.agent
    const config = agent.config

    if (!config?.application_logging?.enabled || (config?.application_logging?.enabled && !config?.application_logging?.local_decorating?.enabled)) {
        console.log('Application logging is not enabled. Skipping instrumentation of Azure Functions invocation context logging.')
        return
    }

    const contextPrototype = module;

    shim.wrap(
        contextPrototype,
        'CreateContextAndInputs',
        function wrapSetup(shim: any, oldSetup: any) {
            return function wrappedSetup() {
                const args = shim.argsToArray.apply(shim, arguments)
                console.log("----------")
                console.log("Instrument setup!!")
                console.log("----------")
                oldSetup.apply(this, args)
            }
        }
    )
}

export const patchContext = (context: any): any => {
    const agent = newrelic?.agent;
    const config = agent?.config;

    if (agent === undefined) {
        return context;
    }

    if (!config?.application_logging?.enabled || (config?.application_logging?.enabled && !config?.application_logging?.local_decorating?.enabled)) {
        return context;
    }

    const oldLogger = context.log;

    const logWithLogger = (logger: Function, ...args: any[]) => {
        let [head, ...tail] = args;
        const newrelicMetadata = newrelic?.agent?.getNRLinkingMetadata()

        if (hasSubtitutionPlaceHolders(head)) {
            head = `${head}${newrelicMetadata}`
        } else {
            tail = [...tail, newrelicMetadata]
        }

        logger.apply(context, [head, ...tail])
    }

    context.log = Object.assign(
        (...args: any[]) => logWithLogger(oldLogger, ...args),
        {
            error: (...args: any[]) => logWithLogger(oldLogger.error, ...args),
            warn: (...args: any[]) => logWithLogger(oldLogger.warn, ...args),
            info: (...args: any[]) => logWithLogger(oldLogger.info, ...args),
            verbose: (...args: any[]) => logWithLogger(oldLogger.verbose, ...args),
        }
    );

    return context;
}

const hasSubtitutionPlaceHolders = (message: string): boolean => {
    const placeholders = ['%o', '%O', '%d', '%i', '%f', '%s', '%c'];
    return placeholders.some((placeholder) => message.includes(placeholder));
}

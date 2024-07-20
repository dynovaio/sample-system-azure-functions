const newrelic = require('newrelic');

const hasSubtitutionPlaceHolders = (message) => {
    if (typeof message !== 'string') {
        return false;
    }

    const placeholders = ['%o', '%O', '%d', '%i', '%f', '%s', '%c'];
    return placeholders.some(
        (placeholder) => message.includes(placeholder)
    );
}

const instrument = (shim, azureFunctions) => {
    const agent = shim.agent
    const config = agent.config

    if (!config.application_logging.enabled) {
        console.log('Application logging is not enabled. Skipping instrumentation of Azure Functions invocation context logging.')
        return
    }

    const contextPrototype = azureFunctions.InvocationContext.prototype
    const logFunctions = ['log', 'trace', 'debug', 'info', 'warn', 'error']

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

const patchAzureContext = (context) => {
    const agent = newrelic.agent;
    const config = agent.config;

    if (agent === undefined) {
        return context;
    }

    if (!config.application_logging.enabled || (config.application_logging.enabled && !config.application_logging.local_decorating.enabled)) {
        return context;
    }

    const oldLogger = context.log;

    const logWithLogger = (logger, ...args) => {
        let [head, ...tail] = args;
        const newrelicMetadata = newrelic.agent.getNRLinkingMetadata()

        if (hasSubtitutionPlaceHolders(head)) {
            head = `${head}${newrelicMetadata}`
        }
        else {
            tail = [...tail, newrelicMetadata]
        }

        logger.apply(context, [head, ...tail])
    }

    context.log = Object.assign(
        (...args) => logWithLogger(oldLogger, ...args),
        {
            error: (...args) => logWithLogger(oldLogger.error, ...args),
            warn: (...args) => logWithLogger(oldLogger.warn, ...args),
            info: (...args) => logWithLogger(oldLogger.info, ...args),
            verbose: (...args) => logWithLogger(oldLogger.verbose, ...args),
        }
    );

    return context;
}

module.exports = {
    instrument,
    patchAzureContext
}

const newrelic = require('newrelic');

const instrument = (shim, azureFunctions) => {
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
    instrument
}

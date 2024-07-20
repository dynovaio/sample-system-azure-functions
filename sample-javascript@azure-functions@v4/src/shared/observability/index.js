const newrelic = require('newrelic');

function wrapAsWebTransaction (url, handler) {
    function wrappedHandler (...args) {
        const wrappedArguments = args;

        return newrelic.startWebTransaction(url, function () {
            let transaction = newrelic.getTransaction();

            try {
                return handler.apply(this, wrappedArguments);
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

module.exports = {
    wrapAsWebTransaction,
    wrapAsBackgroundTransaction,
    wrapAsSegment,
}

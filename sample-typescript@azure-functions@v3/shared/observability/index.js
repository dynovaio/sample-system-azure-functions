const newrelic = require('newrelic');

const wrapAsWebTransaction = (url, handler) => {
    function wrappedHandler (...args) {
        const wrappedArguments = args;

        return newrelic.startWebTransaction(url, function () {
            let transaction = newrelic.getTransaction();

            try {
                return handler.apply(this, wrappedArguments);
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

const wrapAsBackgroundTransaction = (name, handler) => {
    function wrappedHandler (...args) {
        const wrappedArguments = args;

        return newrelic.startBackgroundTransaction(name, function () {
            let transaction = newrelic.getTransaction();

            try {
                return handler.apply(this, wrappedArguments);
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

const wrapAsSegment = (name, handler) => {
    function wrappedHandler (...args) {
        const wrappedArguments = args;

        return newrelic.startSegment(name, true, function () {
            try {
                return handler.apply(this, wrappedArguments);
            } catch (error) {
                newrelic.noticeError(error);
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

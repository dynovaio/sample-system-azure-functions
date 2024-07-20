import * as newrelic from 'newrelic';

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
}

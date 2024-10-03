const getContext = (...args) => {
    const context = args.find(arg => arg && arg.constructor?.name === 'InvocationContext' || arg.constructor?.name === 'c')
    return context ? context : {}
}

const getRequest = (...args) => {
    const request = args.find(arg => arg && (arg.headers || arg.req.headers))

    return request ? request : {}
}

const getProgrammingModelVersion = (...args) => {
    const context = getContext(...args)

    return context.constructor?.name === 'InvocationContext' ? 4 : 3
}

const getHeaders = (...args) => {
    programmingModelVersion = getProgrammingModelVersion(...args)

    if (programmingModelVersion === 4) {
        const request = getRequest(...args)
        return request.headers ? request.headers : {}
    }

    const context = getContext(...args)
    return context.req ? context.req.headers : {}
}

const getLogger = (...args) => {
    const context = getContext(...args)
    const programmingModelVersion = getProgrammingModelVersion(...args)

    return programmingModelVersion === 4 ? context : context.log
}

module.exports = {
    getHeaders,
    getContext,
    getProgrammingModelVersion,
    getLogger
}

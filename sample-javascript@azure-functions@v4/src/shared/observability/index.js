/*
 * Copyright 2024 SoftButterfly SAC. All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 */
'use strict'

const newrelic = require('newrelic')
const { getHeaders } = require('./utils')

const wrapAsWebTransaction = (url, handler) => {
    async function wrappedHandler (...args) {
        const wrappedArguments = args
        const headers = getHeaders(...wrappedArguments)

        return newrelic.startWebTransaction(url, async function webTransaction () {
            let transaction = newrelic.getTransaction()
            transaction.acceptDistributedTraceHeaders('HTTP', headers)

            try {
                return await handler.apply(this, wrappedArguments)
            } catch (error) {
                newrelic.noticeError(error)
                throw error
            } finally {
                transaction.end()
            }
        })
    }

    return wrappedHandler;
}

const wrapAsBackgroundTransaction = (name, handler) => {
    async function wrappedHandler (...args) {
        const wrappedArguments = args
        const headers = getHeaders(...wrappedArguments)

        return newrelic.startBackgroundTransaction(name, async function bacgroundTransaction () {
            let transaction = newrelic.getTransaction()
            transaction.acceptDistributedTraceHeaders('HTTP', headers)

            try {
                return await handler.apply(this, wrappedArguments)
            } catch (error) {
                newrelic.noticeError(error)
                throw error;
            } finally {
                transaction.end()
            }
        })
    }

    return wrappedHandler
}

const wrapAsSegment = (name, handler) => {
    async function wrappedHandler (...args) {
        const wrappedArguments = args

        return newrelic.startSegment(name, true, async function segment () {
            try {
                return await handler.apply(this, wrappedArguments)
            } catch (error) {
                newrelic.noticeError(error)
                throw error
            }
        })
    }

    return wrappedHandler
}

module.exports = {
    wrapAsWebTransaction,
    wrapAsBackgroundTransaction,
    wrapAsSegment
}

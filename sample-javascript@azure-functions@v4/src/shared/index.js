/*
 * Copyright 2024 SoftButterfly SAC. All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 */
'use strict'

const newrelic = require('newrelic')

const wrapAsWebTransaction = (url, handler) => {
    function wrappedHandler (...args) {
        const wrappedArguments = args

        return newrelic.startWebTransaction(url, async function () {
            let transaction = newrelic.getTransaction()

            try {
                return await handler.call(this, ...wrappedArguments)
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
    function wrappedHandler (...args) {
        const wrappedArguments = args

        return newrelic.startBackgroundTransaction(name, async function () {
            let transaction = newrelic.getTransaction()

            try {
                return await handler.call(this, ...wrappedArguments)
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
    function wrappedHandler (...args) {
        const wrappedArguments = args

        return newrelic.startSegment(name, true, async function () {
            try {
                return await handler.call(this, ...wrappedArguments)
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

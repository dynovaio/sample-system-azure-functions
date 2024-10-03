/*
 * Copyright 2024 SoftButterfly SAC. All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 */
'use strict'

const newrelic = require('newrelic');

const instrument = (shim, knex) => {
    shim.setDatastore('Knex')

    const clientPrototype = knex.Client.prototype;

    shim.record(
        clientPrototype,
        'acquireConnection',
        function wrapAcquireConnection (shim, _acquireConnection, _fnName, _args) {
            return new shim.specs.OperationSpec({
                name: _fnName,
                promise: true,
                internal: false,
                record: true,
                callback: null
            })
        }
    )

    shim.record(
        clientPrototype,
        'releaseConnection',
        function wrapReleaseConnection (shim, _releaseConnection, _fnName, _args) {
            return new shim.specs.OperationSpec({
                name: _fnName,
                promise: false,
                internal: false,
                record: true
            })
        }
    )

    shim.record(
        clientPrototype,
        'query',
        function wrapQuery (shim, _query, _fnName, args) {
            const client = args[0]

            return new shim.specs.QuerySpec({
                name: _fnName,
                promise: false,
                callback: null,
                record: true,
                query: args[1].sql,
                internal: false,
                parameters: new shim.specs.params.DatastoreParameters({
                    host: client.host,
                    port_path_or_id: client.port,
                    database_name: client.database,
                })
            })
        }
    );

    /*
    shim.recordQuery(
        clientPrototype,
        ['query'],
        function wrapQuery (shim, _executeRequest, _fnName, args) {
            console.log("---------- ---------- ----------")
            console.log("Knex/query")
            console.log("---------- ---------- ----------")
            const client = args[0]

            return new shim.specs.QuerySpec({
                promise: true,
                query: args[1].sql,
                internal: false,
                parameters: new shim.specs.params.DatastoreParameters({
                    host: client.connectionParameters.host,
                    port_path_or_id: client.connectionParameters.port,
                    database_name: client.connectionParameters.database,
                })
            })
        }
    )
    */

    /*
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
    */
}

module.exports = {
    instrument
}

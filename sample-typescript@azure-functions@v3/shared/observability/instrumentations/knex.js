const instrument = (shim, knex) => {
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

module.exports = {
    instrument
}

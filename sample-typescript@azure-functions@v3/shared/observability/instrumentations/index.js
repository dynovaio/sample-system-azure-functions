const knexInstrumentation = require('./knex');
const azureFunctionsInstrumentation = require('./azure-functions');

module.exports = {
    knexInstrumentation,
    azureFunctionsInstrumentation
}

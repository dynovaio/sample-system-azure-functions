/*
 * Copyright 2024 SoftButterfly SAC. All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 */
'use strict'

const knexInstrumentation = require('./knex');
const azureFunctionsInstrumentation = require('./azure-functions');

module.exports = {
    knexInstrumentation,
    azureFunctionsInstrumentation
}

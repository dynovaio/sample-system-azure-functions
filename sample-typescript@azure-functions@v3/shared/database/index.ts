import * as _ from 'newrelic';

import knex, { Knex } from 'knex';
import { wrapAsSegment } from '../observability';

const config = {
    client: 'pg',
    connection: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        password: process.env.DATABASE_PASSWORD,
        user: process.env.DATABASE_USER,
        database: process.env.DATABASE_NAME,
        ssl: false,
    }
}

export const db: Knex = knex(config)

export async function _getUser(id: number) {
    return await db('users').where({ id }).first()
}

export const getUser = wrapAsSegment('database/_getUser', _getUser)

export async function _createUser(data: any) {
    return await db('users').insert(data).returning('*')
}

export const createUser = wrapAsSegment('database/_createUser', _createUser)

export default db;

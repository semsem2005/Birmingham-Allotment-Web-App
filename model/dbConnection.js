const postgres = require('postgres');
const dotenv = require('dotenv').config();
const sql = postgres(`${process.env.DB_TYPE}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

exports.getConnection = () => {
    return sql;
}
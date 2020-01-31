const mysql = require('mysql2');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname.replace('/util', '') + '/.env')
});

const pool = mysql.createPool({
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  host: process.env.MYSQL_CONNECTION,
  port: process.env.MYSQL_PORT
});

module.exports = pool.promise();

var mysql = require('mysql');
var config = require(__base + '/config/config');

var pool  = mysql.createPool({
  host: config.sql.host_user,
  user: config.sql.user_user,
  password: config.sql.password_user,
  database: config.sql.database_user,
  connectionLimit: config.sql.connectionLimit_user,
  timezone: 'utc',
});

exports.pool = pool;

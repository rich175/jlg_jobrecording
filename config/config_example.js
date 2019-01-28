var config = {};

config.sql = {};
config.api = {};
config.auth = {};
config.email = {};
config.uploads = {};

//User Account and portal stuff
config.sql.host_user = 'localhost';
config.sql.port_user =  '3306';
config.sql.user_user =  'someUser';
config.sql.password_user =  '';
config.sql.database_user = 'someDB';
config.sql.connectionLimit_user = 10;

//shopfloor data
config.sql.host_data = 'localhost';
config.sql.port_data =  '3306';
config.sql.user_data =  'someUser';
config.sql.password_data =  '';
config.sql.database_data = 'someDB';
config.sql.connectionLimit_data = 10;

config.api.port = process.env.WEB_PORT || 3000;
config.api.secretKey = 'testkey';

config.auth.defaultAccessTokenLifetime = 400;// how long to keep access tokens valid
config.auth.defaultRefreshTokenLifetime = 14400; // how long to keep refresh tokens valid
config.auth.timeAllowance = 30; // allow tokens to be up to 30 seconds more than expiry time, system time differences
config.auth.defaultUserRole = 0;
config.auth.emailVerifyExpiry = 172800;

config.email.host = '';
config.email.port = '';
config.email.username = '';
config.email.password = '';
config.email.transport = 'smtps://user%40gmail.com:password@smtp.gmail.com'

config.uploads.directory = "./uploads";
config.uploads.allowedFileTypes = [ 'application/pdf']; // list of mimetypes

module.exports = config;

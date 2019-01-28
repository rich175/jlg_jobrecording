var morgan = require('morgan'); // Morgan is an Express logger
var config = require(__base + '/config/config');
var winston = require('winston');
var logFile = __base + '/logs/server_log.log';

module.exports = function(app) {
  global.logger = new winston.Logger({
    transports: [
      new winston.transports.File({
        level:            'info',
        filename:         logFile,
        handleExceptions: true,
        json:             true,
        maxsize:          5242880, // 5MB
        maxFiles:         5,
        colorize:         false,
      }),
      new winston.transports.Console({
        level:            'debug',
        handleExceptions: true,
        json:             false,
        colorize:         true,
      }),
    ],
    exitOnError: false,
  });

  global.logger.stream = {
    write: function(message, encoding) {
      global.logger.info(message);
    },
  };
  app.use(require('morgan')('combined', { stream: global.logger.stream }));
};

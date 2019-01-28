var express = require('express');
var bodyParser = require('body-parser'); // handle to body-parser
var config = require('./config/config');
var cors = require('cors');

global.__base = __dirname + '/';

var app = express();

/**
 * #Region - Setup Logger
 */
require('./utils/logger')(app);
logger.debug('Logging initiated');

/**
 * Set allowed origins for data requests e.g. just from trakk-it.com and not naughtyhacker.com
 */

var corsOptions = {
  origin: ['http://portal.trakk-it.com/','127.0.0.1','http://localhost','http://localhost:3000'] // only allow requests from portal.trakk-it.com to the API //doesn't seem to work for static files below

};
app.use(cors(corsOptions));

app.disable('x-powered-by'); // why broadcast we're using express, could be a vulnerability (targetted hacking)

/**
 * #Region - App Setup
 */
app.use(bodyParser.urlencoded({
  extended: true,
})); // parsers to get data from requests
app.use(bodyParser.json());

// include the API routing file
require('./routes/routes')(app);

/**
 * #Region - Angular JS Setup
 */
app.use('/font-awesome', express.static(__dirname + '/public_html/font-awesome'));
app.use('/js', express.static(__dirname + '/public_html/js'));
app.use('/img', express.static(__dirname + '/public_html/img'));
app.use('/css', express.static(__dirname + '/public_html/css'));
app.use('/fonts', express.static(__dirname + '/public_html/fonts'));
app.use('/views', express.static(__dirname + '/public_html/views'));
app.use('/directives', express.static(__dirname + '/public_html/directives'));
app.use('/services', express.static(__dirname + '/public_html/services'));


app.all('/', function(req, res, next) {
  res.sendFile('index.html', { root: __dirname + '/public_html' });
});

// include the API routing file
require('./routes/routes')(app);

app.use(function(req, res, next) {
  //no route found
  res.status(404);
  res.sendFile('404.html', { root: __dirname + '/public_html/views/error' });
});

// START THE SERVER
app.listen(config.api.port);
logger.info('frostNode is online at port: ' + config.api.port);

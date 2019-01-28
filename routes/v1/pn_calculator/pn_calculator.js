/*
This web service is for
*/

var express = require('express');
var router = express.Router();
var mysql = require(__base + '/utils/sqlUserPool2').pool;
var userModel = require(__base + '/models/users');
var jwt = require('jsonwebtoken');
var fs = require('fs');

router.use(function(req, res, next) {
    //logger.debug('Company js is working');
    next();
});

router.get('', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Retriving all JLG material main categories');


    function readJSONFile(filename, callback) {
        fs.readFile(filename, function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            try {
                callback(null, JSON.parse(data));
            } catch (exception) {
                callback(exception);
            }
        });
    }

    readJSONFile('./routes/v1/pn_calculator/fastener.json', function (err, json) {
  if(err) { throw err; }
  res.json(json);
});




});


router.route('/pn_calculator');

module.exports = router;

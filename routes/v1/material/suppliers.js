/*
This web service is for managing material suppliers
*/

var express = require('express');
var router = express.Router();
var mysql = require(__base + '/utils/sqlUserPool2').pool;
var userModel = require(__base + '/models/users');
var jwt = require('jsonwebtoken');

router.use(function(req, res, next) {
    //logger.debug('Company js is working');
    next();
});

router.get('', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Retriving JLG Approved Suppliers');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    sup.idmaterial_supplier AS Sup_DBID, \
                    sup.name AS Supplier \
                    FROM material_supplier sup';

        mysql.query(sqlQuery, function(err2, rows) {
            if (!err2) {
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })
    }

});



router.delete('', function(req, res) {
    //Do not want a delete, can just remove quantity down to zero

});
router.put('/', function(req, res) {

});

router.post('/', function(req, res) {


    /* req.body = {
      name: '',
      contact: '',

    }
  */
    var _email = res.locals.userData.email;

    logger.info('New supplier entry is being saved : ' + JSON.stringify(req.body));
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "INSERT INTO material_supplier \
                (`name`, `contact`)\
                 VALUES\
                  (?, ? )";
        var array = [req.body.name,
            req.body.contact
        ];
        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                res.json({
                    status: 'ok'
                });
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })
    }

});



router.route('/supplier');

module.exports = router;

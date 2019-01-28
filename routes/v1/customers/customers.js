/*
This web service is for mananging customers
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

router.get('/', function(req, res) {

    logger.info('The list of JLG customers has been requested');

    function getData() {
        //get individual jobs notes
        var sqlQuery = "SELECT idcustomer AS db_id,\
                    name AS Customer,\
                    address AS Address,\
                    postcode AS Postcode,\
                    phone AS Phone,\
                      phone2 AS Phone2,\
                      email AS Email, \
                    contact_name AS Contact\
                     FROM customer;";
        mysql.query(sqlQuery, req.params.jobNumber_DB, function(err2, rows) {
            if (!err2) {
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })


    };
    getData();
});

router.get('/:id', function(req, res) {

    logger.info('A single JLG customer has been requested');

    function getData() {
        //get individual jobs notes
        var sqlQuery = "SELECT idcustomer AS db_id,\
                    name AS Customer,\
                    address AS Address,\
                    postcode AS Postcode,\
                    phone AS Phone,\
                      phone2 AS Phone2,\
                      email AS Email, \
                    contact_name AS Contact\
                     FROM customer \
                     WHERE idcustomer = ?";
        mysql.query(sqlQuery, req.params.id, function(err2, rows) {
            if (!err2) {
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })


    };
    getData();
});

router.delete('/:customerID', function(req, res) {


    logger.info('A JLG Customer is being deleted, instance id: ' + req.params.customerID);
    //find the User's company ID

    function getData() {

        var sqlQuery = "DELETE FROM customer WHERE idcustomer = ?";
        var array = req.params.customerID;
        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                res.json({
                    ok: true
                });
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })
    };
    getData();

});
router.put('/', function(req, res) {
    //{update: {inUse: 0 }, id: 1};
    var _data = req.body.update;
    var _id = req.body.id;

    logger.info('A JLG Customer is being updated, instance id: ' + req.body.id);

    function setData() {
        //logger.debug(user);

        var sqlQuery = "UPDATE customer SET ? WHERE idcustomer = ?";

        mysql.query(sqlQuery, [_data, _id], function(err2, rows) {
            if (!err2) {

                res.json({
                    ok: true
                });

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })


    };
    setData();

});
router.post('/', function(req, res) {
    /* req.body = {
      name: ''
    }
    */
    logger.info('A new JLG Customer is being saved, instance id: ' + req.body.name);
    //find the User's company ID

    function getData() {

        var sqlQuery = "INSERT INTO customer \
              (`name`, `address`,`postcode`, `phone`, `phone2`, `contact_name`, `email`) \
              VALUES (?, ?, ?, ?, ?, ?, ?);";

        var array = [req.body.name,
            req.body.address,
            req.body.postcode,
            req.body.phone,
            req.body.phone2,
            req.body.contact_name,
            req.body.email
        ];
        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    };
    getData();
});



module.exports = router;

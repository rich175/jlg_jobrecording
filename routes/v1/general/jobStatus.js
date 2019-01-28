/*
This web service is for job status
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

        var sqlQuery = "SELECT idjob_status AS db_id,\
                    description AS Description \
                     FROM job_status;";
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

router.delete('/:customerID', function(req, res) {




});
router.put('/', function(req, res) {

});
router.post('/', function(req, res) {});



module.exports = router;

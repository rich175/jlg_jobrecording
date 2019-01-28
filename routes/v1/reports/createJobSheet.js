/*
This web service is for the retrieval of the BRs which are currently being processed
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

router.get('/:jobNumber', function(req, res) {

    var _email = res.locals.userData.email;
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    //Get the Job sheet for that particular Number
    function getData(err, user) {
        //logger.debug(user);


        mysql.query("SELECT a.*, b.firstname FROM jlgeorge.work_instance a\
                JOIN employee b\
                ON b.idemployee = a.employee_idemployee\
                WHERE job_idjob = (SELECT idjob FROM job WHERE jlg_jobnumber = ?)\
                ORDER BY a.stoptime ASC", req.params.jobNumber, function(err2, rows) {
            if (!err2) {

                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['starttime']) {
                        rows[i]['starttime'] = rows[i]['starttime'].toUTCString();
                        rows[i]['stoptime'] = rows[i]['stoptime'].toUTCString();
                    }
                    if (rows[i]['comments']) {

                        rows[i]['comments'] = rows[i]['comments'].replace(/<br\s*\/?>/mg, "\r\n");



                    }
                    if (rows[i]['materials']) {
                        rows[i]['materials'] = rows[i]['materials'].replace(/<br\s*\/?>/mg, "\r\n");
                    }
                    //logger.debug(rows[i]['Last_Worked']);
                }
                res.json(rows);

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    }
});
router.get('/:request/:identifier', function(req, res) {
    var _email = res.locals.userData.email;
    if (req.params.request === '1') {

        logger.info('Job Sheet Rev2 For: ' + req.params.identifier);

        //find the User's company ID
        userModel.getUserData(_email, null, getData);
    }

    function getData(err, user) {
        //logger.debug(user);


        mysql.query("SELECT a.*, unix_timestamp(a.starttime) as starttime_s, \
         unix_timestamp(a.stoptime) as stoptime_s, \
              b.firstname FROM jlgeorge.work_instance a\
              JOIN employee b\
              ON b.idemployee = a.employee_idemployee\
              WHERE job_idjob = ?\
              ORDER BY a.stoptime ASC", req.params.identifier, function(err2, rows) {
            if (!err2) {

                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['starttime']) {
                        rows[i]['starttime'] = rows[i]['starttime'].toUTCString();
                        rows[i]['stoptime'] = rows[i]['stoptime'].toUTCString();
                    }
                    if (rows[i]['comments']) {

                        rows[i]['comments'] = rows[i]['comments'].replace(/<br\s*\/?>/mg, "\r\n");



                    }
                    if (rows[i]['materials']) {
                        rows[i]['materials'] = rows[i]['materials'].replace(/<br\s*\/?>/mg, "\r\n");
                    }
                    //logger.debug(rows[i]['Last_Worked']);
                }
                res.json(rows);

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    }

});
router.delete('/', function(req, res) {

});
router.put('/', function(req, res) {

});

router.post('/', function(req, res) {

});



router.route('/activeBRs');

module.exports = router;

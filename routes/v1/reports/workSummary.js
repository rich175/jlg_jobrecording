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

router.get('/:employeeID/:start/:end', function(req, res) {

    var _email = res.locals.userData.email;
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    //Get the Job sheet for that particular Number
    function getData(err, user) {
        //logger.debug(user);

        var array = [req.params.employeeID, req.params.start,  req.params.end];

        var query = "SELECT tbl.date, SUM(tbl.duration) as duration,tbl.jlg_jobnumber, tbl.userID FROM ( \
            SELECT \
            DATE_FORMAT(date(wrk.stoptime), '%Y-%c-%e') AS date, \
            TIMESTAMPDIFF(MINUTE, wrk.starttime, wrk.stoptime) as duration, \
            wrk.employee_idemployee as userID, \
            jb.jlg_jobnumber \
            FROM work_instance wrk\
            LEFT JOIN job jb \
            ON jb.idjob = wrk.job_idjob \
            WHERE wrk.employee_idemployee = ? \
            AND wrk.starttime > ? \
            AND wrk.starttime < ? \
            ORDER BY date(wrk.stoptime) DESC) tbl \
            GROUP BY tbl.date, tbl.jlg_jobnumber";

        mysql.query(query, array, function(err2, rows) {
            if (!err2) {

                res.json(rows);

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    }
});
router.get('', function(req, res) {


});
router.delete('/', function(req, res) {

});
router.put('/', function(req, res) {

});

router.post('/', function(req, res) {

});



router.route('/activeBRs');

module.exports = router;

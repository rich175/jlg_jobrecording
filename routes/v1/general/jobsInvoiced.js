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

router.get('/', function(req, res) {

    var _email = res.locals.userData.email;
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    //Get the Job sheet for that particular Number
    function getData(err, user) {
        //logger.debug(user);


        mysql.query("SELECT a.machine as Machine,\
                   a.tacho as Tacho,\
                   a.site as Site,\
                   a.description as Description,\
                   a.order_number as OrderNumber,\
                   a.id_number as ID_Number,\
                   a.jlg_jobnumber as Job_Number,\
                   a.creation_date as Creation_Date,\
                   a.finished as Finished,\
                   a.invoiced as Invoiced,\
                   b.name as Customer,\
                   c.stoptime as Last_Worked\
                   FROM jlgeorge.job a \
                   JOIN customer b \
                   ON b.idcustomer = a.customer_idcustomer\
                   LEFT JOIN (SELECT * FROM (SELECT stoptime, job_idjob FROM work_instance ORDER BY stoptime DESC) as temp GROUP BY job_idjob) as c\
                   ON c.job_idjob = a.idjob\
                   WHERE a.invoiced = 1", function(err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['Last_Worked']) {
                        var tempTime = rows[i]['Last_Worked'];
                        //  logger.debug(tempTime);
                        var tempTime2 = tempTime.toUTCString();
                        //  logger.debug(tempTime2);
                        rows[i]['Last_Worked'] = tempTime2;
                        //logger.debug(rows[i]['Last_Worked']);
                    } else {
                        rows[i]['Last_Worked'] = "No Work Recorded";
                    }
                }
                res.json(rows);

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    }
});
router.get('/', function(req, res) {


});
router.delete('/', function(req, res) {

});
router.put('/', function(req, res) {

});

router.post('/', function(req, res) {

});



router.route('/activeBRs');

module.exports = router;

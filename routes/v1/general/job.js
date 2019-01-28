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

    logger.info('A list of all JLG jobs is being requested');
    var _email = res.locals.userData.email;
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    //Get the Job sheet for that particular Number
    function getData(err, user) {
        //logger.debug(user);

        //get individual br asset report

        var _sql = "SELECT a.machine as Machine,\
               a.tacho as Tacho,\
               a.site as Site,\
               a.description as Description,\
               a.order_number as OrderNumber,\
               a.id_number as ID_Number,\
               a.jlg_jobnumber as Job_Number,\
               a.creation_date as Creation_Date,\
               a.`mileage_e/w` as Mileage,\
               a.job_status_idjob_status as Status_id,\
               st.description as Status, \
               a.finished as Finished,\
               a.invoiced as Invoiced,\
               a.idjob as DB_ID, \
               b.name as Customer,\
               IF(c.stoptime IS NULL, 'Not Started', c.stoptime) as Last_Worked\
               FROM jlgeorge.job a \
               JOIN job_status st \
               ON st.idjob_status = a.job_status_idjob_status \
               JOIN customer b \
               ON b.idcustomer = a.customer_idcustomer\
               LEFT JOIN (SELECT * FROM (SELECT stoptime, job_idjob FROM work_instance ORDER BY stoptime DESC) as temp GROUP BY job_idjob) as c\
               ON c.job_idjob = a.idjob";
        //logger.info(_sql);
        mysql.query(_sql, function(err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {

                    if (rows[i]['Last_Worked'] != "Not Started") {
                        var tempTime = new Date(rows[i]['Last_Worked']);
                        logger.debug(tempTime);
                        var tempTime2 = tempTime.toUTCString();
                        //  logger.debug(tempTime2);
                        rows[i]['Last_Worked'] = tempTime2;
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

router.get('/:job_number', function(req, res) {

    logger.info('Job info for job number: ' + req.params.job_number);
    var _email = res.locals.userData.email;
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    //Get the Job sheet for that particular Number
    function getData(err, user) {
        //logger.debug(user);

        //get individual br asset report

        var _sql = "SELECT a.machine as Machine,\
               a.tacho as Tacho,\
               a.site as Site,\
               a.description as Description,\
               a.order_number as OrderNumber,\
               a.id_number as ID_Number,\
               a.jlg_jobnumber as Job_Number,\
               a.creation_date as Creation_Date,\
               a.`mileage_e/w` as Mileage,\
               a.job_status_idjob_status as Status_id,\
               st.description as Status, \
               a.finished as Finished,\
               a.invoiced as Invoiced,\
               a.idjob as DB_ID, \
               b.name as Customer,\
               IF(c.stoptime IS NULL, 'Not Started', c.stoptime) as Last_Worked\
               FROM jlgeorge.job a \
               JOIN job_status st \
               ON st.idjob_status = a.job_status_idjob_status \
               JOIN customer b \
               ON b.idcustomer = a.customer_idcustomer\
               LEFT JOIN (SELECT * FROM (SELECT stoptime, job_idjob FROM work_instance ORDER BY stoptime DESC) as temp GROUP BY job_idjob) as c\
               ON c.job_idjob = a.idjob \
               WHERE a.jlg_jobnumber = ?";
        //logger.info(_sql);
        var _array = [req.params.job_number];
        mysql.query(_sql, _array, function(err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {

                    if (rows[i]['Last_Worked'] != "Not Started") {
                        var tempTime = new Date(rows[i]['Last_Worked']);
                        logger.debug(tempTime);
                        var tempTime2 = tempTime.toUTCString();
                        //  logger.debug(tempTime2);
                        rows[i]['Last_Worked'] = tempTime2;
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

router.delete('/:job_dbid', function(req, res) {


    logger.info('A JLG job is being deleted, instance id: ' + req.params.job_dbid);
    //find the User's company ID


    function getData() {

        var sqlQuery = "DELETE FROM job WHERE idjob = ?";
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

    logger.info('A JLG Job is being updated, instance id: ' + req.body.id);

    function setData() {
        //logger.debug(user);
        var sqlQuery = "UPDATE job SET ? WHERE idjob = ?";

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
    /* req.body = {
      job_number:'',
      customer: '',
      customerDB: '',
      description: '',
      tacho:'',
      site:'',
      machine:'',
      serial:'',
      mileage:'',
      status:'',
      statusDB:'',
      orderNumber:'',
    }
    */

    var _jsDate = new Date();
    var year, month, day, hours, minutes, seconds;
    year = String(_jsDate.getFullYear());
    month = String(_jsDate.getMonth() + 1);
    if (month.length == 1) {
        month = "0" + month;
    }
    day = String(_jsDate.getDate());
    if (day.length == 1) {
        day = "0" + day;
    }
    hours = String(_jsDate.getHours());
    if (hours.length == 1) {
        hours = "0" + hours;
    }
    minutes = String(_jsDate.getMinutes());
    if (minutes.length == 1) {
        minutes = "0" + minutes;
    }
    seconds = String(_jsDate.getSeconds());
    if (seconds.length == 1) {
        seconds = "0" + seconds;
    }
    // should return something like: 2011-06-16 13:36:00
    var _formattedDate = year + "-" + month + "-" + day + ' ' + hours + ':' + minutes + ':' + seconds;

    logger.info('A new JLG Job is being saved, instance id: ' + req.body.job_number);
    //find the User's company ID

    function getData() {

        var sqlQuery = "INSERT INTO job \
              (`machine`,`tacho`,`site`,`description`,`order_number`,\
                `id_number`,`mileage_e/w`,`customer_idcustomer`,`jlg_jobnumber`,`creation_date`,`job_status_idjob_status`) \
              VALUES (?,?,?,?,?,?,?,?,?,?,?);";

        var array = [req.body.machine,
            req.body.tacho,
            req.body.site,
            req.body.description,
            req.body.orderNumber,
            req.body.serial,
            req.body.mileage,
            req.body.customerDB,
            req.body.job_number,
            _formattedDate,
            req.body.statusDB

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

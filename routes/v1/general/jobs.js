/*
This web service is for the retrieval of the BRs which are currently being processed
*/

var express = require('express');
var router = express.Router();
var mysql = require(__base + '/utils/sqlUserPool2').pool;
var userModel = require(__base + '/models/users');
var jwt = require('jsonwebtoken');

router.use(function (req, res, next) {
    //logger.debug('Company js is working');
    next();
});

router.get('/:status', function (req, res) {

    //job status 1 = in prog, 2 = quarr, 3 = finished, 4 = invoiced, 5= all, 6=all-invoiced
    logger.info("Getting a list of jobs, status: " + req.params.status);

    var _email = res.locals.userData.email;
    //find the User's company ID
    if (req.params.status === "5" || req.params.status === "6") {
        userModel.getUserData(_email, null, getAllJobTypes);
    } else if (req.params.status === "7") {
        userModel.getUserData(_email, null, getAllNonPriority);
    } else if (req.params.status === "8") {
        userModel.getUserData(_email, null, getAllPriority);
    } else {
        userModel.getUserData(_email, null, getSomeJobTypes);
    }


    //Get the Job sheet for that particular Number
    function getSomeJobTypes(err, user) { //logger.debug(user);
        var array = [];

        var sqlQuery = `SELECT 
        a.machine as Machine,
        a.tacho as Tacho,
        a.site as Site,
        a.description as Description,
        a.order_number as OrderNumber,
        a.id_number as ID_Number,
        a.jlg_jobnumber as Job_Number,
        a.creation_date as Creation_Date,
        a.finished as Finished,
        a.invoiced as Invoiced,
        a.priority as Priority, 
        b.idcustomer as Customer_dbid,
        b.name as Customer,
        a.idjob as DBID, 
        js.description as Status, 
        a.job_status_idjob_status as StatusID, 
        IF(c.stoptime IS NULL, 'No Work Recorded', c.stoptime) as Last_Worked
    FROM job a 
    JOIN customer b ON b.idcustomer = a.customer_idcustomer
    JOIN job_status js ON js.idjob_status = a.job_status_idjob_status
    LEFT JOIN (
        SELECT MAX(stoptime) as stoptime, job_idjob 
        FROM work_instance 
        GROUP BY job_idjob
    ) as c ON c.job_idjob = a.idjob 
    WHERE a.job_status_idjob_status = ?`;




        mysql.query(sqlQuery, req.params.status, function (err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['Last_Worked']) {
                        try {
                            var tempTime = rows[i]['Last_Worked'];
                            //  logger.debug(tempTime);

                            var tempTime2 = tempTime.toUTCString();
                            //  logger.debug(tempTime2);
                            rows[i]['Last_Worked'] = tempTime2;
                        } catch (err) {

                        }
                        //logger.debug(rows[i]['Last_Worked']);
                    } else {
                        rows[i]['Last_Worked'] = "No Work Recorded";
                    }
                    if (rows[i]['description']) {
                        rows[i]['description'] = rows[i]['description'].replace(/(\r\n|\n|\r|\t)/gm, "");
                    }

                    let jsDate= rows[i]['Creation_Date'];
                    let year = jsDate.getFullYear();
                    let month = ('0' + (jsDate.getMonth() + 1)).slice(-2);
                    let day = ('0' + jsDate.getDate()).slice(-2);
                    rows[i]['Created_Date_HR'] = `${year}-${month}-${day}`;

                }
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })
    }

    function getAllJobTypes(err, user) { //logger.debug(user);


        var sqlQuery = "SELECT a.machine as Machine,\
                 a.tacho as Tacho,\
                 a.site as Site,\
                 a.description as Description,\
                 a.order_number as OrderNumber,\
                 a.id_number as ID_Number,\
                 a.jlg_jobnumber as Job_Number,\
                 a.creation_date as Creation_Date,\
                 a.finished as Finished,\
                 a.invoiced as Invoiced,\
                 b.idcustomer as Customer_dbid,\
                 b.name as Customer,\
                 a.idjob as DBID, \
                  a.priority as Priority, \
                 js.description as Status, \
                 a.job_status_idjob_status as StatusID, \
                 IF(c.stoptime IS NULL, 'No Work Recorded', c.stoptime) as Last_Worked\
                 FROM job a \
                 JOIN customer b \
                 ON b.idcustomer = a.customer_idcustomer\
                 JOIN job_status js \
                 ON js.idjob_status = a.job_status_idjob_status\
                 LEFT JOIN (SELECT * FROM (SELECT stoptime, job_idjob FROM work_instance ORDER BY stoptime DESC) as temp GROUP BY job_idjob) as c\
                 ON c.job_idjob = a.idjob";
        if (req.params.status === "6") {
            sqlQuery = sqlQuery + " WHERE job_status_idjob_status != 4";
        }

        mysql.query(sqlQuery, function (err2, rows) {

            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['Last_Worked']) {

                        try {
                            var tempTime = rows[i]['Last_Worked'];
                            //  logger.debug(tempTime);

                            var tempTime2 = tempTime.toUTCString();
                            //  logger.debug(tempTime2);
                            rows[i]['Last_Worked'] = tempTime2;
                        } catch (err) {

                        }


                        //logger.debug(rows[i]['Last_Worked']);
                    } else {
                        rows[i]['Last_Worked'] = "No Work Recorded";
                    }

                    if (rows[i]['description']) {
                        rows[i]['description'] = rows[i]['description'].replace(/(\r\n|\n|\r|\t)/gm, "");
                    }
                    let jsDate= rows[i]['Creation_Date'];
                    let year = jsDate.getFullYear();
                    let month = ('0' + (jsDate.getMonth() + 1)).slice(-2);
                    let day = ('0' + jsDate.getDate()).slice(-2);
                    rows[i]['Created_Date_HR'] = `${year}-${month}-${day}`;

                }
                res.json(rows);

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    }

    function getAllNonPriority(err, user) { //logger.debug(user);


        var sqlQuery = "SELECT a.machine as Machine,\
                 a.tacho as Tacho,\
                 a.site as Site,\
                 a.description as Description,\
                 a.order_number as OrderNumber,\
                 a.id_number as ID_Number,\
                 a.jlg_jobnumber as Job_Number,\
                 a.creation_date as Creation_Date,\
                 a.finished as Finished,\
                 a.invoiced as Invoiced,\
                 b.idcustomer as Customer_dbid,\
                 b.name as Customer,\
                 a.idjob as DBID, \
                  a.priority as Priority, \
                 js.description as Status, \
                 a.job_status_idjob_status as StatusID, \
                 IF(c.stoptime IS NULL, 'No Work Recorded', c.stoptime) as Last_Worked\
                 FROM job a \
                 JOIN customer b \
                 ON b.idcustomer = a.customer_idcustomer\
                 JOIN job_status js \
                 ON js.idjob_status = a.job_status_idjob_status\
                 LEFT JOIN (SELECT * FROM (SELECT stoptime, job_idjob FROM work_instance ORDER BY stoptime DESC) as temp GROUP BY job_idjob) as c\
                 ON c.job_idjob = a.idjob \
                WHERE (job_status_idjob_status = 1 OR job_status_idjob_status = 2) AND a.priority = 0;";

        mysql.query(sqlQuery, function (err2, rows) {

            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['Last_Worked']) {
                        try {
                            var tempTime = rows[i]['Last_Worked'];
                            //  logger.debug(tempTime);
                            var tempTime2 = tempTime.toUTCString();
                            //  logger.debug(tempTime2);
                            rows[i]['Last_Worked'] = tempTime2;
                        } catch (err) {

                        }
                    } else {
                        rows[i]['Last_Worked'] = "No Work Recorded";
                    }
                    if (rows[i]['description']) {
                        rows[i]['description'] = rows[i]['description'].replace(/(\r\n|\n|\r|\t)/gm, "");
                    }
                    let jsDate= rows[i]['Creation_Date'];
                    let year = jsDate.getFullYear();
                    let month = ('0' + (jsDate.getMonth() + 1)).slice(-2);
                    let day = ('0' + jsDate.getDate()).slice(-2);
                    rows[i]['Created_Date_HR'] = `${year}-${month}-${day}`;

                }
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })
    }

    function getAllPriority(err, user) { //logger.debug(user);


        var sqlQuery = "SELECT a.machine as Machine,\
                 a.tacho as Tacho,\
                 a.site as Site,\
                 a.description as Description,\
                 a.order_number as OrderNumber,\
                 a.id_number as ID_Number,\
                 a.jlg_jobnumber as Job_Number,\
                 a.creation_date as Creation_Date,\
                 a.finished as Finished,\
                 a.invoiced as Invoiced,\
                 b.idcustomer as Customer_dbid,\
                 b.name as Customer,\
                 a.idjob as DBID, \
                  a.priority as Priority, \
                 js.description as Status, \
                 a.job_status_idjob_status as StatusID, \
                 IF(c.stoptime IS NULL, 'No Work Recorded', c.stoptime) as Last_Worked\
                 FROM job a \
                 JOIN customer b \
                 ON b.idcustomer = a.customer_idcustomer\
                 JOIN job_status js \
                 ON js.idjob_status = a.job_status_idjob_status\
                 LEFT JOIN (SELECT * FROM (SELECT stoptime, job_idjob FROM work_instance ORDER BY stoptime DESC) as temp GROUP BY job_idjob) as c\
                 ON c.job_idjob = a.idjob \
                WHERE (job_status_idjob_status = 1 OR job_status_idjob_status = 2) AND a.priority = 1;";

        mysql.query(sqlQuery, function (err2, rows) {

            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['Last_Worked']) {
                        try {
                            var tempTime = rows[i]['Last_Worked'];
                            //  logger.debug(tempTime);
                            var tempTime2 = tempTime.toUTCString();
                            //  logger.debug(tempTime2);
                            rows[i]['Last_Worked'] = tempTime2;
                        } catch (err) {

                        }
                    } else {
                        rows[i]['Last_Worked'] = "No Work Recorded";
                    }
                    if (rows[i]['description']) {
                        rows[i]['description'] = rows[i]['description'].replace(/(\r\n|\n|\r|\t)/gm, "");
                    }
                    let jsDate= rows[i]['Creation_Date'];
                    let year = jsDate.getFullYear();
                    let month = ('0' + (jsDate.getMonth() + 1)).slice(-2);
                    let day = ('0' + jsDate.getDate()).slice(-2);
                    rows[i]['Created_Date_HR'] = `${year}-${month}-${day}`;

                }
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })
    }
});
router.get('/:status/:customers', function (req, res) {

    //job status 1 = in prog, 2 = quarr, 3 = finished, 4 = invoiced


    var _email = res.locals.userData.email;
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    //Get the Job sheet for that particular Number
    function getData(err, user) { //logger.debug(user);

        //get individual br asset report

        var sqlQuery = "SELECT a.machine as Machine,\
                 a.tacho as Tacho,\
                 a.site as Site,\
                 a.description as Description,\
                 a.order_number as OrderNumber,\
                 a.id_number as ID_Number,\
                 a.jlg_jobnumber as Job_Number,\
                 a.creation_date as Creation_Date,\
                 a.finished as Finished,\
                 a.invoiced as Invoiced,\
                  a.priority as Priority, \
                 b.idcustomer as Customer_dbid,\
                 b.name as Customer,\
                 a.idjob as DBID, \
                 js.description as Status, \
                 a.job_status_idjob_status as StatusID, \
                 IF(c.stoptime IS NULL, 'No Work Recorded', c.stoptime) as Last_Worked\
                 FROM job a \
                 JOIN customer b \
                 ON b.idcustomer = a.customer_idcustomer\
                 JOIN job_status js \
                 ON js.idjob_status = a.job_status_idjob_status\
                 LEFT JOIN (SELECT * FROM (SELECT stoptime, job_idjob FROM work_instance ORDER BY stoptime DESC) as temp GROUP BY job_idjob) as c\
                 ON c.job_idjob = a.idjob";
        if (req.params.status === 5) {

        } else {
            sqlQuery = sqlQuery + " WHERE job_status_idjob_status = ?";
        }

        mysql.query(sqlQuery, req.params.status, function (err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['Last_Worked']) {

                        try {
                            var tempTime = rows[i]['Last_Worked'];
                            //  logger.debug(tempTime);

                            var tempTime2 = tempTime.toUTCString();
                            //  logger.debug(tempTime2);
                            rows[i]['Last_Worked'] = tempTime2;
                        } catch (err) {

                        }


                        //logger.debug(rows[i]['Last_Worked']);
                    } else {
                        rows[i]['Last_Worked'] = "No Work Recorded";
                    }

                    if (rows[i]['description']) {
                        rows[i]['description'] = rows[i]['description'].replace(/(\r\n|\n|\r|\t)/gm, "");
                    }
                    let jsDate= rows[i]['Creation_Date'];
                    let year = jsDate.getFullYear();
                    let month = ('0' + (jsDate.getMonth() + 1)).slice(-2);
                    let day = ('0' + jsDate.getDate()).slice(-2);
                    rows[i]['Created_Date_HR'] = `${year}-${month}-${day}`;

                }
                res.json(rows);

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })
    }
});
router.get('/', function (req, res) {
    function getData() {
        //get individual jobs notes

        var sqlQuery = "SELECT \
              jb.jlg_jobnumber AS jobNumber, \
              jb.idjob AS db_id, \
              cust.name AS customer, \
              js.description AS status \
              FROM job jb \
              JOIN customer cust \
              ON cust.idcustomer = jb.customer_idcustomer \
              JOIN job_status js \
              ON js.idjob_status = jb.job_status_idjob_status";

        mysql.query(sqlQuery, function (err2, rows) {
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
router.delete('/', function (req, res) {

});
router.put('/', function (req, res) {
    //{update: {inUse: 0 }, id: 1};
    var _data = req.body.update;
    var _id = req.body.id;

    function setData() {
        //logger.debug(user);

        var sqlQuery = "UPDATE job SET ? WHERE idjob = ?";

        mysql.query(sqlQuery, [_data, _id], function (err2, rows) {
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

router.post('/', function (req, res) {
    var _jobNumbers = req.body.jb_db_id;

    var _jbMySQLStatement = '';

    for (var i = 0; i < _jobNumbers.length; i++) {
        if (_jobNumbers.length - 1 === i) {
            _jbMySQLStatement = _jbMySQLStatement + 'a.idjob = ' + _jobNumbers[i];
        } else {
            _jbMySQLStatement = _jbMySQLStatement + 'a.idjob = ' + _jobNumbers[i] + ' OR ';
        }
    };


    var sqlQuery = "SELECT a.machine as Machine,\
                 a.tacho as Tacho,\
                 a.site as Site,\
                 a.description as Description,\
                 a.order_number as OrderNumber,\
                 a.id_number as ID_Number,\
                 a.jlg_jobnumber as Job_Number,\
                 a.creation_date as Creation_Date,\
                 a.finished as Finished,\
                 a.invoiced as Invoiced,\
                  a.priority as Priority, \
                 b.idcustomer as Customer_dbid,\
                 b.name as Customer,\
                 a.idjob as DBID, \
                 js.description as Status, \
                 a.job_status_idjob_status as StatusID, \
                 IF(c.stoptime IS NULL, 'No Work Recorded', c.stoptime) as Last_Worked\
                 FROM job a \
                 JOIN customer b \
                 ON b.idcustomer = a.customer_idcustomer\
                 JOIN job_status js \
                 ON js.idjob_status = a.job_status_idjob_status\
                 LEFT JOIN (SELECT * FROM (SELECT stoptime, job_idjob FROM work_instance ORDER BY stoptime DESC) as temp GROUP BY job_idjob) as c\
                 ON c.job_idjob = a.idjob \
                 WHERE " + _jbMySQLStatement;


    mysql.query(sqlQuery, req.params.status, function (err2, rows) {
        if (!err2) {
            for (var i = 0; i < rows.length; i++) {
                if (rows[i]['Last_Worked']) {

                    try {
                        var tempTime = rows[i]['Last_Worked'];
                        //  logger.debug(tempTime);

                        var tempTime2 = tempTime.toUTCString();
                        //  logger.debug(tempTime2);
                        rows[i]['Last_Worked'] = tempTime2;
                    } catch (err) {

                    }


                    //logger.debug(rows[i]['Last_Worked']);
                } else {
                    rows[i]['Last_Worked'] = "No Work Recorded";
                }

                if (rows[i]['description']) {
                    rows[i]['description'] = rows[i]['description'].replace(/(\r\n|\n|\r|\t)/gm, "");
                }
                let jsDate= rows[i]['Creation_Date'];
                let year = jsDate.getFullYear();
                let month = ('0' + (jsDate.getMonth() + 1)).slice(-2);
                let day = ('0' + jsDate.getDate()).slice(-2);
                rows[i]['Created_Date_HR'] = `${year}-${month}-${day}`;

            }
            res.json(rows);

        } else {
            logger.debug('error:', err2);
            res.status(500).send(err);
        }
    })

});



module.exports = router;

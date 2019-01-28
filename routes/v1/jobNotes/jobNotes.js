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

router.get('/:jobNumber_DB', function(req, res) {

    function getData() {
        //get individual jobs notes

        var sqlQuery = "SELECT \
                jn.idjob_notes AS db_id, \
                jn.note AS text, \
                jn.timecreated AS time_created, \
                usr.firstName AS firstName, \
                jb.jlg_jobnumber AS job_number \
                FROM job_notes jn \
                JOIN users usr \
                ON usr.id = jn.user_id \
                JOIN job jb \
                ON jb.idjob = jn.job_idjob \
                WHERE jn.job_idjob = ?";
        mysql.query(sqlQuery, req.params.jobNumber_DB, function(err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    rows[i].text = rows[i].text.replace(/<br\s*\/?>/mg, "\n");
                    var date = new Date(+rows[i].time_created)
                    rows[i].time_created = date.toDateString();

                    var _strDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

                    rows[i].time_excel_format = _strDate;

                }
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    };
    getData();
});
router.get('/', function(req, res) {
    function getData() {

        var sqlQuery = "SELECT \
              jn.idjob_notes AS db_id, \
              jn.note AS text, \
                jn.timecreated AS time_created, \
              usr.firstName AS firstName, \
              jb.jlg_jobnumber AS job_number \
              FROM job_notes jn \
              JOIN users usr \
              ON usr.id = jn.user_id \
              JOIN job jb \
              ON jb.idjob = jn.job_idjob";
        mysql.query(sqlQuery, function(err2, rows) {
            if (!err2) {

                for (var i = 0; i < rows.length; i++) {
                    rows[i].text = rows[i].text.replace(/<br\s*\/?>/mg, "\n");
                    rows[i].time_created = new Date(rows[i].time_created).toDateString();

                }
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    };
    getData();

});
router.delete('/', function(req, res) {


    logger.info('A note is being deleted, instance id: ' + req.paras.noteID);
    //find the User's company ID

    if (!err) {
        var sqlQuery = "DELETE FROM job_notes WHERE idjob_notes = ?";
        var array = req.paras.noteID;
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

    function setData() {
        //logger.debug(user);


        var sqlQuery = "UPDATE job_notes SET ? WHERE idjob_notes = ?";

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
      note: '',
      job_dbid: ''
    }
    */
    logger.info('New note is being saved: ' + req.note);
    //find the User's company ID

    function getData() {

        var sqlQuery = "INSERT INTO job_notes \
              (`user_id`, `note`, `job_idjob`, `timecreated`) \
              VALUES (?, ?, ?, ?);";

        var array = [res.locals.userData.id,
            req.body.text,
            req.body.job,
            req.body.dateEpoch,

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

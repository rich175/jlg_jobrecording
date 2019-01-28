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

    logger.info('Get work for job number: ' + req.params.jobNumber);

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    wk.idwork_instance AS db_id,\
                    emp.firstname AS Engineer,\
                    wk.starttime AS StartTime,\
                    wk.stoptime AS EndTime,\
                    wk.comments AS Notes,\
                    wk.materials AS Materials\
                    wk.job_idjob AS JLG_DB, \
                    FROM work_instance wk\
                    JOIN employee emp\
                    ON emp.idemployee = wk.employee_idemployee\
                    WHERE wk.job_idjob = (SELECT idjob FROM job WHERE jlg_jobnumber = ?)';
        var array = req.params.jobNumber;
        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    rows[i].Materials = rows[i].Materials.replace(/<br\s*\/?>/mg, "\n");
                    rows[i].Notes = rows[i].Notes.replace(/<br\s*\/?>/mg, "\n");
                }
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })
    }

});
router.get('/:startDate/:endDate', function(req, res) {
    var _email = res.locals.userData.email;

    logger.info('Get work for any jobs between: ' + req.params.startDate + ' and ' + req.params.endDate);

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = "SELECT \
                wk.idwork_instance AS db_id,\
                jb.jlg_jobnumber AS JLG,\
                jb.idjob AS JLG_DB, \
                emp.firstname AS Engineer,\
                wk.starttime AS StartTime,\
                wk.stoptime AS EndTime,\
                wk.comments AS Notes,\
                wk.materials AS Materials\
                FROM work_instance wk\
                JOIN employee emp\
                ON emp.idemployee = wk.employee_idemployee\
                JOIN job jb\
                ON jb.idjob = wk.job_idjob\
                WHERE wk.starttime >= ?\
                AND wk.stoptime <= ?";
        var array = [req.params.startDate, req.params.endDate];
        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    rows[i].Materials = rows[i].Materials.replace(/<br\s*\/?>/mg, "\n");
                    rows[i].Notes = rows[i].Notes.replace(/<br\s*\/?>/mg, "\n");
                }
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })

    }

});

router.get('/:startDate/:endDate/:userID', function(req, res) {
    var _email = res.locals.userData.email;

    logger.info('Get work for any jobs between: ' + req.params.startDate + ' and ' + req.params.endDate);

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = "SELECT \
                wk.idwork_instance AS db_id,\
                jb.jlg_jobnumber AS JLG,\
                jb.idjob AS JLG_DB, \
                emp.firstname AS Engineer,\
                (unix_timestamp(wk.starttime)*1000) AS StartTime,\
                (unix_timestamp(wk.stoptime)*1000) AS EndTime,\
                wk.comments AS Notes,\
                wk.materials AS Materials\
                FROM work_instance wk\
                JOIN employee emp\
                ON emp.idemployee = wk.employee_idemployee\
                JOIN job jb\
                ON jb.idjob = wk.job_idjob\
                WHERE wk.starttime >= ? \
                AND wk.stoptime <= ? \
                AND wk.employee_idemployee = ?";
        var array = [req.params.startDate, req.params.endDate, user.id];
        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                for (var i = 0; i < rows.length; i++) {
                    rows[i].Materials = rows[i].Materials.replace(/<br\s*\/?>/mg, "\n");
                    rows[i].Notes = rows[i].Notes.replace(/<br\s*\/?>/mg, "\n");
                }
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })
    }

});

router.delete('/:workID', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Work is being deleted, instance id: ' + req.params.workID);
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "DELETE FROM work_instance WHERE idwork_instance = ?";
        var array = req.params.workID;
        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                res.json({
                    ok: true
                });
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })

    }

});
router.put('/', function(req, res) {
    /*
      req.body ={
      db_wkid: '',
      update: {starttime: ''}
    }
    */

    var _data = req.body.update;
    var _id = req.body.db_wkid;

    var _email = res.locals.userData.email;

    logger.info('Work is being saved: ' + req.body);
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "UPDATE work_instance SET ? WHERE idwork_instance = ?";

        mysql.query(sqlQuery, [_data, _id], function(err2, rows) {
            if (!err2) {
                res.json({
                    ok: true
                });
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })

    }


});

router.post('/', function(req, res) {


    /* req.body = {
      db_jobid: '',
      db_empid: '',
      start: '',
      end:'',
      comments: '',
      materials: '',
    }
  */
    var _email = res.locals.userData.email;

    logger.info('Work is being saved: ' + req.body);
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

                var sqlQuery = "INSERT INTO work_instance \
                (`job_idjob`, `employee_idemployee`, `starttime`, `stoptime`, `comments`, `materials`)\
                 VALUES\
                  (?, ?, ?, ?, ?, ?);";
                var array = [req.body.db_jobid,
                    user.id,
                    req.body.start,
                    req.body.end,
                    req.body.comments,
                    req.body.materials
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



router.route('/work');

module.exports = router;

/*
This web service is for creating and managing instances of material consumption
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

    logger.info('Get all instances of material consumption');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    mat_C.idmaterial_consumed AS Consumption_DBID, \
                    jlgP.main_cat AS Main_Cat,\
                    jlgP.sub_cat_1 AS Sub_Cat_1,\
                    jlgP.sub_cat_2 AS Sub_Cat_2,\
                    jlgP.description AS Description,\
                    jlgP.description AS JLG_Description,\
                    mat_C.comment AS Comment, \
                    mat_C.quantity AS QTY,\
                    un.sh_unit AS Unit,\
                    un.lh_unit AS Unit_Full,\
                    un.idmaterial_units AS Unit_DBID,\
                    jb.jlg_jobnumber, \
                    mat_C.date AS Date_of_Consumption, \
                    jlgP.jlg_pn AS JLG_PN, \
                    mat_C.pn_idmaterial_jlgpn AS JLG_PN_DBID, \
                    mat_C.sup_pn AS Sup_PN, \
                    sup.name AS Supplier, \
                    sup.idmaterial_supplier AS Supplier_DBID \
                    FROM material_consumed mat_C \
                    LEFT JOIN material_supplier sup \
                    ON sup.idmaterial_supplier = mat_C.supplier \
                    LEFT JOIN material_jlgpn jlgP \
                    ON jlgP.idmaterial_jlgpn = mat_C.pn_idmaterial_jlgpn \
                    LEFT JOIN material_units un \
                    ON un.idmaterial_units = mat_C.unit \
                    LEFT JOIN job jb \
                    ON jb.idjob = mat_C.job_idjob';

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

router.get('/:request/:identifier', function(req, res) {

    var _email = res.locals.userData.email;

    if (req.params.request === '1') {

        logger.info('Get instances of material consumption for job_DBID:' + req.params.identifier);

        //find the User's company ID
        userModel.getUserData(_email, null, getData);
    }
    else if (req.params.request === '2') {

        logger.info('Get instances of material consumption for PN:' + req.params.identifier);

        //find the User's company ID
        userModel.getUserData(_email, null, getPNData);
    }

    function getPNData(err, user) {
        var array = req.params.identifier;
        var sqlQuery = 'SELECT \
                    mat_C.idmaterial_consumed AS Consumption_DBID, \
                    jlgP.main_cat AS Main_Cat,\
                    jlgP.sub_cat_1 AS Sub_Cat_1,\
                    jlgP.sub_cat_2 AS Sub_Cat_2,\
                    jlgP.description AS Description,\
                    jlgP.description AS JLG_Description,\
                    jlgP.base_price AS Base_Price, \
                    mat_C.comment AS Comment, \
                    mat_C.quantity AS QTY,\
                    un.sh_unit AS Unit,\
                    un.lh_unit AS Unit_Full,\
                    un.idmaterial_units AS Unit_DBID,\
                    jb.jlg_jobnumber, \
                    mat_C.date AS Date_of_Consumption, \
                    jlgP.jlg_pn AS JLG_PN, \
                    mat_C.pn_idmaterial_jlgpn AS JLG_PN_DBID, \
                    mat_C.sup_pn AS Sup_PN, \
                    sup.name AS Supplier, \
                    sup.idmaterial_supplier AS Supplier_DBID \
                    FROM material_consumed mat_C \
                    LEFT JOIN material_supplier sup \
                    ON sup.idmaterial_supplier = mat_C.supplier \
                    LEFT JOIN material_jlgpn jlgP \
                    ON jlgP.idmaterial_jlgpn = mat_C.pn_idmaterial_jlgpn \
                    LEFT JOIN material_units un \
                    ON un.idmaterial_units = mat_C.unit \
                    LEFT JOIN job jb \
                    ON jb.idjob = mat_C.job_idjob \
                    WHERE jlgP.idmaterial_jlgpn = ?';

        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })
    }

    function getData(err, user) {
        var array = req.params.identifier;
        var sqlQuery = 'SELECT \
                    mat_C.idmaterial_consumed AS Consumption_DBID, \
                    jlgP.main_cat AS Main_Cat,\
                    jlgP.sub_cat_1 AS Sub_Cat_1,\
                    jlgP.sub_cat_2 AS Sub_Cat_2,\
                    jlgP.description AS Description,\
                    jlgP.description AS JLG_Description,\
                    jlgP.base_price AS C_Base_Price, \
                    mat_C.base_price as Base_Price,\
                    mat_C.comment AS Comment, \
                    ROUND(mat_C.base_price * -mat_C.quantity,2) AS Total_Cost, \
                    mat_C.quantity AS QTY,\
                    un.sh_unit AS Unit,\
                    un.lh_unit AS Unit_Full,\
                    un.idmaterial_units AS Unit_DBID,\
                    jb.jlg_jobnumber, \
                    mat_C.date AS Date_of_Consumption, \
                    jlgP.jlg_pn AS JLG_PN, \
                    mat_C.pn_idmaterial_jlgpn AS JLG_PN_DBID, \
                    mat_C.sup_pn AS Sup_PN, \
                    sup.name AS Supplier, \
                    sup.idmaterial_supplier AS Supplier_DBID \
                    FROM material_consumed mat_C \
                    LEFT JOIN material_supplier sup \
                    ON sup.idmaterial_supplier = mat_C.supplier \
                    LEFT JOIN material_jlgpn jlgP \
                    ON jlgP.idmaterial_jlgpn = mat_C.pn_idmaterial_jlgpn \
                    LEFT JOIN material_units un \
                    ON un.idmaterial_units = mat_C.unit \
                    LEFT JOIN job jb \
                    ON jb.idjob = mat_C.job_idjob \
                    WHERE jb.idjob = ?';

        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })
    }

});

router.delete('/:consumptionID', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Instance of material consumption is being deleted, instance id: ' + req.params.consumptionID);
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "DELETE FROM material_consumed WHERE idmaterial_consumed = ?";
        var array = req.params.consumptionID;
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
    //DO WE WANT A UPDATE?  MAY BE BETTER TO JUST LOG IT AS NEW CONSUMPTION? OR DELETE AND RE-ENTER?
    /*
      req.body ={
      db_wkid: '',
      update: {starttime: ''}
    }
    */

    var _data = req.body.update;



    var _email = res.locals.userData.email;

    logger.info('Material stock is being updated: ' + JSON.stringify(req.body));
    //find the User's company ID
    if (req.body.db_stockid)
    {
        var _id = req.body.db_stockid;
        userModel.getUserData(_email, null, getData);
    }
    else if (req.body.db_pnid){
      var _id = req.body.db_pnid;
      userModel.getUserData(_email, null, getData2);
    }
    else {
      res.json({
          ok: true
      });
    }


    function getData(err, user) {

    };
    function getData2(err, user) {

        var sqlQuery = "UPDATE material_consumed SET ? WHERE pn_idmaterial_jlgpn = ?";

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

    };

});

router.post('/', function(req, res) {


    /* req.body = {
      main_cat: '',
      sub_cat_1: '',
      description: '',
      quantity:'',
      unit: '',
      job_idjob: '',
      date: '',
      jlg_pn: '',
      jlg_pn_dbid: '',
      sup_pn: '',
      supplier_DB: '',
    }
  */
    var _email = res.locals.userData.email;

    logger.info('New material consumption is being saved: ' + JSON.stringify(req.body));
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {
      var comment = '';
      if(req.body.comments)
      {
        comment = req.body.comments;
      }
        var sqlQuery = "INSERT INTO material_consumed \
                (`quantity`, `unit`, `job_idjob`, `date`, `pn_idmaterial_jlgpn`, `sup_pn`, `supplier`, `user_iduser`, `comment`, `base_price`)\
                 VALUES\
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        var array = [
            req.body.quantity,
            req.body.unit,
            req.body.job_idjob,
            req.body.date,
            req.body.jlg_pn_dbid,
            req.body.sup_pn,
            req.body.supplier_DB,
            user.id,
            comment,
            req.body.base_price,
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



router.route('/consumption');

module.exports = router;

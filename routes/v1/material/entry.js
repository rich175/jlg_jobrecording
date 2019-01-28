/*
This web service is for creating and managing instances of material entry
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

    logger.info('Get all materials entries');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    mat_E.idmaterial_entry AS Entry_DBID, \
                    jlgP.main_cat AS Main_Cat,\
                    jlgP.sub_cat_1 AS Sub_Cat_1,\
                    jlgP.description AS Description,\
                    jlgP.description AS JLG_Description,\
                    mat_E.quantity AS QTY,\
                    mat_E.unit AS Unit,\
                    mat_E.price AS Cost_Price, \
                    mat_E.price_per AS Unit_Cost_Price, \
                    mat_E.date AS Date_of_Entry, \
                    jlgP.jlg_pn AS JLG_PN, \
                    mat_E.pn_idmaterial_jlgpn AS JLG_PN_DBID, \
                    mat_E.sup_pn AS Sup_PN, \
                    sup.name AS Supplier \
                    FROM material_entry mat_E \
                    LEFT JOIN material_supplier sup \
                    ON sup.idmaterial_supplier = mat_E.supplier \
                    LEFT JOIN material_jlgpn jlgP \
                    ON jlgP.idmaterial_jlgpn = mat_E.pn_idmaterial_jlgpn';

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

router.get('/:state/:variable', function(req, res) {

    var _email = res.locals.userData.email;

    if (req.params.state === '1') {
        logger.info('Get all materials entries which are incomplete');
        userModel.getUserData(_email, null, getData);
    } else if  (req.params.state === '2'){
        logger.info('Getting all material entries for PN: ' + req.params.variable);
        userModel.getUserData(_email, null, getPNData);
    }



    function getPNData(err, user) {

        var sqlQuery = `SELECT
                  mat_E.idmaterial_entry AS Entry_DBID,
                  jlgP.main_cat AS Main_Cat,
                  jlgP.sub_cat_1 AS Sub_Cat_1,
                  jlgP.description AS Description,
                  jlgP.description AS JLG_Description,
                  mat_E.quantity AS QTY,
                  mat_E.comment AS Comment,
                  mat_E.price AS Cost_Price,
                  mat_E.price_per AS Unit_Cost_Price,
                  mat_E.date AS Date_of_Entry,
                  jlgP.jlg_pn AS JLG_PN,
                  mat_E.pn_idmaterial_jlgpn AS JLG_PN_DBID, \
                  mat_E.sup_pn AS Sup_PN,
                  un.sh_unit AS Unit,
                  un.lh_unit AS Unit_Full,
                  un.idmaterial_units AS Unit_DBID,
                  usr.firstName AS User,
                  sup.name AS Supplier
                  FROM material_entry mat_E
                  LEFT JOIN material_supplier sup
                  ON sup.idmaterial_supplier = mat_E.supplier
                  LEFT JOIN material_jlgpn jlgP
                  ON jlgP.idmaterial_jlgpn = mat_E.pn_idmaterial_jlgpn
                  LEFT JOIN users usr
                  ON usr.id = mat_E.user_iduser
                  LEFT JOIN material_units un
                  ON un.idmaterial_units = mat_E.unit
                  WHERE jlgP.idmaterial_jlgpn = ?`;

        mysql.query(sqlQuery, req.params.variable, function(err2, rows) {
            if (!err2) {
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })
    }

    function getData(err, user) {

        var sqlQuery = `SELECT
                    mat_E.idmaterial_entry AS Entry_DBID,
                    jlgP.main_cat AS Main_Cat,
                    jlgP.sub_cat_1 AS Sub_Cat_1,
                    jlgP.description AS Description,
                    jlgP.description AS JLG_Description,
                    mat_E.quantity AS QTY,
                    mat_E.comment AS Comment,
                    mat_E.price AS Cost_Price,
                    mat_E.price_per AS Unit_Cost_Price,
                    mat_E.date AS Date_of_Entry,
                    jlgP.jlg_pn AS JLG_PN,
                    mat_E.pn_idmaterial_jlgpn AS JLG_PN_DBID,
                    mat_E.sup_pn AS Sup_PN,
                    un.sh_unit AS Unit,
                    un.lh_unit AS Unit_Full,
                    un.idmaterial_units AS Unit_DBID,
                    usr.firstName AS User,
                    sup.name AS Supplier
                    FROM material_entry mat_E
                    LEFT JOIN material_supplier sup
                    ON sup.idmaterial_supplier = mat_E.supplier
                    LEFT JOIN material_jlgpn jlgP
                    ON jlgP.idmaterial_jlgpn = mat_E.pn_idmaterial_jlgpn
                    LEFT JOIN users usr
                    ON usr.id = mat_E.user_iduser
                    LEFT JOIN material_units un
                    ON un.idmaterial_units = mat_E.unit
                    WHERE (mat_E.price IS NULL OR mat_E.price = '' OR mat_E.price = '0.00' OR mat_E.price = '0')
                      AND (mat_E.comment != 'Stock Adjustment')`;

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

router.delete('/:entryID', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Material entry is being deleted, instance id: ' + req.params.entryID);
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "DELETE FROM material_entry WHERE idmaterial_entry = ?";
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
    var _id = req.body.db_entryid;

    var _email = res.locals.userData.email;

    logger.info('Material entry is being updated: ' + JSON.stringify(req.body));
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "UPDATE material_entry SET ? WHERE idmaterial_entry = ?";

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
      main_cat: '',
      sub_cat_1: '',
      description: '',
      quantity:'',
      unit:'',
      price: '',
      price_per: '',
      date: '',
      jlg_pn: '',
      jlg_pn_dbid: '',
      sup_pn: '',
      supplier_DB: '',
      supplier_name:''
    }
  */
    var _email = res.locals.userData.email;

    logger.info('New material entry is being saved: ' + JSON.stringify(req.body));
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        //--------------
        //Part 2
        //--------------
        var sqlQuerySup = "INSERT INTO material_supplier \
                (`name`)\
                 VALUES\
                  (?)  ON DUPLICATE KEY UPDATE \
                    name= name";
        var arraySup = [req.body.supplier_name];
        mysql.query(sqlQuerySup, arraySup, function(err2, rows) {
            if (!err2) {


              var sqlQuery = "INSERT INTO material_entry \
                                          (`quantity`, `unit`, `price` \
                                          , `price_per`, `date`, `pn_idmaterial_jlgpn`, `sup_pn`, `supplier`, `user_iduser`, comment)\
                                           VALUES\
                                            (?, ?, ?, ?, ?, ?, ?,(SELECT idmaterial_supplier FROM material_supplier WHERE name = ?),?,?);";
              var array = [
                  req.body.quantity,
                  req.body.unit,
                  req.body.price,
                  req.body.price_per,
                  req.body.date,
                  req.body.jlg_pn_dbid,
                  req.body.sup_pn,
                  req.body.supplier_name,
                  user.id,
                  req.body.comments,
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

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })










    }

});



router.route('/entry');

module.exports = router;

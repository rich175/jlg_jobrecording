/*
This web service is for  managing material stock
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

    logger.info('Retriving JLG Material Stock');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    stk.idmaterial_stock AS Stock_DBID, \
                    jlgP.main_cat AS Main_Cat,\
                    jlgP.sub_cat_1 AS Sub_Cat_1,\
                    jlgP.sub_cat_2 AS Sub_Cat_2,\
                    jlgP.description AS JLG_Description,\
                    jlgP.base_price AS Base_Price, \
                    jlgP.idmaterial_jlgpn AS PN_DBID, \
                    stk.quantity AS QTY,\
                    un.sh_unit AS Unit,\
                    un.lh_unit AS Unit_Full,\
                    un.idmaterial_units AS Unit_DBID,\
                    jlgP.jlg_pn AS JLG_PN, \
                    stk.pn_idmaterial_jlgpn AS JLG_PN_DBID, \
                    stk.sup_pn AS Sup_PN, \
                    sup.name AS Supplier, \
                      sup.idmaterial_supplier AS Supplier_DBID \
                    FROM material_stock stk \
                    LEFT JOIN material_units un \
                    ON un.idmaterial_units = stk.unit \
                    LEFT JOIN material_supplier sup \
                    ON sup.idmaterial_supplier = stk.supplier \
                    LEFT JOIN material_jlgpn jlgP \
                    ON jlgP.idmaterial_jlgpn = stk.pn_idmaterial_jlgpn \
                    WHERE stk.quantity > 0';

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
router.get('/:PN_DBID', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Retriving JLG Material Stock');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    stk.quantity AS QTY,\
                    un.sh_unit AS Unit,\
                    un.lh_unit AS Unit_Full,\
                    un.idmaterial_units AS Unit_DBID,\
                    jlgP.jlg_pn AS JLG_PN, \
                    stk.pn_idmaterial_jlgpn AS JLG_PN_DBID, \
                    stk.sup_pn AS Sup_PN, \
                    sup.name AS Supplier, \
                    sup.idmaterial_supplier AS Supplier_DBID \
                    FROM material_stock stk \
                    LEFT JOIN material_units un \
                    ON un.idmaterial_units = stk.unit \
                    LEFT JOIN material_supplier sup \
                    ON sup.idmaterial_supplier = stk.supplier \
                    LEFT JOIN material_jlgpn jlgP \
                    ON jlgP.idmaterial_jlgpn = stk.pn_idmaterial_jlgpn \
                    WHERE stk.pn_idmaterial_jlgpn = ?';

        mysql.query(sqlQuery, req.params.PN_DBID ,function(err2, rows) {
            if (!err2) {
                res.json(rows);
            } else {
                logger.debug('error:', err2);
                res.status(500).send(err2);
            }
        })
    }

});

router.get('/:mainCat/:sub1/:sub2', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Retriving JLG Material Stock');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    stk.idmaterial_stock AS Stock_DBID, \
                    jlgP.main_cat AS Main_Cat,\
                    jlgP.sub_cat_1 AS Sub_Cat_1,\
                    jlgP.sub_cat_2 AS Sub_Cat_2,\
                    jlgP.description AS JLG_Description,\
                    jlgP.base_price AS Base_Price, \
                    jlgP.idmaterial_jlgpn AS PN_DBID, \
                    stk.quantity AS QTY,\
                    un.sh_unit AS Unit,\
                    un.lh_unit AS Unit_Full,\
                    un.idmaterial_units AS Unit_DBID,\
                    jlgP.jlg_pn AS JLG_PN, \
                    stk.pn_idmaterial_jlgpn AS JLG_PN_DBID, \
                    stk.sup_pn AS Sup_PN, \
                    sup.name AS Supplier, \
                      sup.idmaterial_supplier AS Supplier_DBID \
                    FROM material_stock stk \
                    LEFT JOIN material_supplier sup \
                    ON sup.idmaterial_supplier = stk.supplier \
                    LEFT JOIN material_jlgpn jlgP \
                    ON jlgP.idmaterial_jlgpn = stk.pn_idmaterial_jlgpn \
                    LEFT JOIN material_units un \
                    ON un.idmaterial_units = stk.unit \
                    WHERE jlgP.main_cat = ?';
        var array = [req.params.mainCat];

        if (req.params.sub1 != 'false') {
            sqlQuery = sqlQuery + ' AND jlgP.sub_cat_1 = ? ';
            array.push(req.params.sub1);
        }
        if (req.params.sub2 != 'false') {
            sqlQuery = sqlQuery + ' AND jlgP.sub_cat_2 = ? ';
            array.push(req.params.sub2);
        }

        //logger.debug(sqlQuery);
        //logger.debug(JSON.stringify(array));
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
    //Do not want a delete, can just remove quantity down to zero

});
router.put('/', function(req, res) {
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

        var sqlQuery = "UPDATE material_stock SET ? WHERE idmaterial_stock = ?";

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
    function getData2(err, user) {

        var sqlQuery = "UPDATE material_stock SET ? WHERE pn_idmaterial_jlgpn = ?";

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
      jlg_pn: '',
      jlg_pn_dbid:'',
      sup_pn: '',
      supplier_DB: '',
    }
  */
    var _email = res.locals.userData.email;

    logger.info('New material entry is being saved into stock: ' + JSON.stringify(req.body));
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "INSERT INTO material_stock \
                (`quantity`, `unit`, `pn_idmaterial_jlgpn`, `sup_pn`, `supplier`)\
                 VALUES\
                  (?, ?, ?, ?, (SELECT idmaterial_supplier FROM material_supplier WHERE name = ?)) \
                  ON DUPLICATE KEY UPDATE \
                  quantity= quantity + ?";
        var array = [
            req.body.quantity,
            req.body.unit,
            req.body.jlg_pn_dbid,
            req.body.sup_pn,
            req.body.supplier_name,
          req.body.quantity,
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



router.route('/stock');

module.exports = router;

/*
This web service is for  managing part numbers
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

    logger.info('Retriving all part numbers');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = `SELECT
                    pn.idmaterial_jlgpn as PN_DBID,
                    pn.jlg_pn AS JLG_PN,
                    pn.main_cat AS Main_Cat,
                    pn.sub_cat_1 AS Sub_Cat_1,
                    pn.sub_cat_2 AS Sub_Cat_2,
                    pn.date AS Creation_Date,
                    pn.description AS PN_Description,
                    pn.obsolete AS Obsolete,
                    pn.superseded AS Superseded_By,
                    pn.base_price AS Base_Price,
                    un.sh_unit AS Unit,
                    un.lh_unit AS Unit_Full,
                    un.idmaterial_units AS Unit_DBID
                    FROM material_jlgpn pn
                    LEFT JOIN material_units un
                    ON un.idmaterial_units = pn.unit`;

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

router.get('/:startPN', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Retriving Part Numbers Starting With: ' + req.params.startPN);

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = `SELECT
                    pn.idmaterial_jlgpn as PN_DBID,
                    pn.jlg_pn AS JLG_PN,
                    pn.idmaterial_jlgpn AS JLG_PN_DBID, \
                    pn.main_cat AS Main_Cat,
                    pn.sub_cat_1 AS Sub_Cat_1,
                    pn.sub_cat_2 AS Sub_Cat_2,
                    pn.date AS Creation_Date,
                    pn.description AS PN_Description,
                    pn.obsolete AS Obsolete,
                    pn.superseded AS Superseded_By,
                      pn.base_price AS Base_Price,
                    un.sh_unit AS Unit,
                    un.lh_unit AS Unit_Full,
                    un.idmaterial_units AS Unit_DBID
                    FROM material_jlgpn pn
                    LEFT JOIN material_units un
                    ON un.idmaterial_units = pn.unit
                    WHERE pn.jlg_pn LIKE ?`;
        var array = [req.params.startPN + '%'];

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


router.delete('/', function(req, res) {


});
router.put('/', function(req, res) {
    /*
      req.body ={
      db_wkid: '',
      update: {starttime: ''}
    }
    */

    var _data = req.body.update;
    var _id = req.body.db_pnid;

    var _email = res.locals.userData.email;

    logger.info('Part Number Entry is being updated: ' + JSON.stringify(req.body));
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "UPDATE material_jlgpn SET ? WHERE idmaterial_jlgpn = ?";

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

    var _email = res.locals.userData.email;

    logger.info('New part number is being saved: ' + JSON.stringify(req.body));
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {
        //--------------
        //Part 1
        //--------------
        var sqlQueryCats = "INSERT INTO material_types \
            (`main_cat`, `sub_cat_1`, `sub_cat_2`)\
             VALUES\
              (?, ?, ?)  ON DUPLICATE KEY UPDATE \
                sub_cat_2= sub_cat_2";
        var arrayCats = [req.body.main_cat,
            req.body.sub_cat_1,
            req.body.sub_cat_2
        ];
        mysql.query(sqlQueryCats, arrayCats, function(err2, rows) {
            if (!err2) {
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
                        var sqlQuery = `INSERT INTO material_jlgpn
                  (jlg_pn, main_cat, sub_cat_1, sub_cat_2, base_price, date, description, unit)
                  VALUES
                  (?, ?, ?, ?, ?, ?,?,?)`;

                        var array = [req.body.jlg_pn,
                            req.body.main_cat,
                            req.body.sub_cat_1,
                            req.body.sub_cat_2,
                            req.body.base_price,
                            new Date().getTime(),
                            req.body.description,
                            req.body.unit
                        ];

                        mysql.query(sqlQuery, array, function(err2, rows) {
                            if (!err2) {
                                res.json({
                                    status: 'okz',
                                    lastID: rows.insertId
                                });
                            } else {
                                //logger.debug('error:', err2);
                                //logger.debug(err2.code);
                                if (err2.code === "ER_DUP_ENTRY") {
                                    res.send('Duplicate');
                                } else {
                                    res.status(500).send(err2);
                                }

                            }
                        })



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



router.route('/partnumber');

module.exports = router;

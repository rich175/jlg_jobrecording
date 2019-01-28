/*
This web service is for  managing material categories
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

    logger.info('Retriving all JLG material main categories');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    DISTINCT(mtype.main_cat) as Main_Cats \
                    FROM material_types mtype';

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

router.get('/:mainCat', function(req, res) {

    var _email = res.locals.userData.email;

    logger.info('Retriving all JLG material sub categories of: ' + req.params.mainCat);

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {
        var array = [req.params.mainCat];
        var sqlQuery = 'SELECT \
                    mtype.idmaterial_types AS Cat_DBID, \
                    mtype.main_cat AS Main_Cat,\
                    mtype.sub_cat_1 AS Sub_Cat_1,\
                    mtype.sub_cat_2 AS Sub_Cat_2,\
                    mtype.style AS Label_Style \
                    FROM material_types mtype \
                    WHERE mtype.main_cat = ?';

        mysql.query(sqlQuery, array, function(err2, rows) {
            if (!err2) {
              logger.info('data:', rows);
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
  //needed?

});

router.post('/', function(req, res) {


    /* req.body = {
      main_cat: '',
      sub_cat_1: '',
      sub_cat_2: '',
      style:'',
    }
  */
    var _email = res.locals.userData.email;

    logger.info('New material category is being saved : ' + JSON.stringify(req.body));
    //find the User's company ID
    userModel.getUserData(_email, null, getData);

    function getData(err, user) {

        var sqlQuery = "INSERT INTO material_types \
                (`main_cat`, `sub_cat_1`, `sub_cat_2`, `style`)\
                 VALUES\
                  (?, ?, ?, ?)";
        var array = [req.body.main_cat,
            req.body.sub_cat_1,
            req.body.sub_cat_2,
            req.body.style
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



router.route('/categories');

module.exports = router;

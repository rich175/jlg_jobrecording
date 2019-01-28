/*
This web service is for managing material unit types
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

    logger.info('Retriving all JLG material units');

    //find the User's company ID
    userModel.getUserData(_email, null, getData);


    function getData(err, user) {

        var sqlQuery = 'SELECT \
                    unit.idmaterial_units AS Unit_DBID, \
                    unit.sh_unit AS Unit, \
                    unit.lh_unit AS Unit_Description \
                    FROM material_units unit';

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



router.delete('', function(req, res) {
    //Do not want a delete, can just remove quantity down to zero

});
router.put('/', function(req, res) {

});

router.post('/', function(req, res) {



});



router.route('/units');

module.exports = router;

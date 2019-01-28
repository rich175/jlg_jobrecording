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

router.get('/:active', function(req, res) {

    var _email = res.locals.userData.email;
    //find the User's company ID
    logger.debug('HERE');
    userModel.getUserData(_email, null, getData);

    //Get the Job sheet for that particular Number
    function getData(err, user) {


        var array = [req.params.active];

        var query = "SELECT id, firstName, lastName, active \
            FROM jlgeorge_test.users \
            WHERE active = ?";

        mysql.query(query, array, function(err2, rows) {
            if (!err2) {

                res.json(rows);

            } else {
                logger.debug('error:', err2);
                res.status(500).send(err);
            }
        })

    }
});
router.get('', function(req, res) {
  var _email = res.locals.userData.email;
  //find the User's company ID
  userModel.getUserData(_email, null, getData);

  //Get the Job sheet for that particular Number
  function getData(err, user) {
      //logger.debug(user);

      var query = "SELECT id, firstName, lastName, active \
          FROM jlgeorge_test.users";

      mysql.query(query, function(err2, rows) {
          if (!err2) {

              res.json(rows);

          } else {
              logger.debug('error:', err2);
              res.status(500).send(err);
          }
      })

  }

});
router.delete('/', function(req, res) {

});
router.put('/', function(req, res) {

});

router.post('/', function(req, res) {

});



router.route('/activeBRs');

module.exports = router;

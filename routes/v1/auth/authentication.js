var express = require('express');
var router = express.Router();
var userModel = require(__base + '/models/users');

router.use(function(req, res, next) {
    // logger.debug('Authentication is happening.');
    next();
});

router.get('/', function(req, res) {
  logger.debug('******************************************************');
  userModel.getUsers(function(err, data) {
    if (err) {
      res.json({error: 'User Already Exists'});
      logger.debug(err);
    } else {
      res.json(data);
    }

  });
});


router.post('/register', function(req, res) {
    userModel.register(req, function(err, data) {
        if (err) {
            res.json({
                error: 'User Already Exists'
            });
            logger.debug(err);
        } else {
            res.json(data);
        }

    });
});

router.post('/', function(req, res) {
    logger.debug('@@@@@IM HERE@@@');
    if (req.body.GRANT_TYPE === 'PASSWORD') {
        userModel.login(req, function(err, data) {
            if (err) {
                res.json({
                    error: err.message
                });
                logger.debug(err);
            }
            res.json(data);
        });
    } else if (req.body.GRANT_TYPE === 'REFRESH_TOKEN') {
        // requesting a new access and refresh token
        userModel.reAuthenticate(req, function(err, data) {
            if (err) {
                res.json({
                    error: err.message
                });
                logger.debug(err);
            }
            res.json(data);
        });
    } else {
        logger.debug('Unknown GRANT_TYPE: ' + req.body.GRANT_TYPE);
        res.json({
            error: 'Unexpected GRANT_TYPE'
        });
    }
});


module.exports = router;

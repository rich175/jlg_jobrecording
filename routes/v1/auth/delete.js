var express = require('express');
var router = express.Router();
var userModel = require(__base + '/models/users');

router.use(function(req, res, next) {
  // logger.debug('Authentication is happening.');
  next();
});


router.post('/register', function(req, res) {
  userModel.register(req.body.USERNAME, req.body.PASSWORD, req.body.CLIENT_ID, function(err, data) {
    if (err) {
      res.json({error: 'User Already Exists'});
      logger.debug(err);
    } else {
      res.json(data);
    }

  });
});

router.post('/', function(req, res) {
  if (req.body.GRANT_TYPE === 'PASSWORD') {
    userModel.login(req.body.USERNAME, req.body.PASSWORD, req.body.CLIENT_ID, function(err, data) {
      if (err) {
        res.json({error: err.message});
        logger.debug(err);
      }
      res.json(data);
    });
  } else if (req.body.GRANT_TYPE === 'REFRESH_TOKEN') {
    // requesting a new access and refresh token
    userModel.reAuthenticate(req.body.USER_ID, req.body.CLIENT_ID, req.body.REFRESH_TOKEN, function(err, data) {
      if (err) {
        res.json({error: err.message});
        logger.debug(err);
      }
      res.json(data);
    });
  } else {
    logger.debug('Unknown GRANT_TYPE: ' + req.body.GRANT_TYPE);
    res.json({error: 'Unexpected GRANT_TYPE'});
  }
});


module.exports = router;

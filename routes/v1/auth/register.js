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

module.exports = router;

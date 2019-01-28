var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
  logger.debug('Something is happening.');
  next();
});

router.get('/', function(req, res) {
  res.json({ message: 'Welcome to the contact get/edit/add route!!!' });
});


router.route('/company')

  .post(function(req, res) {
    res.json({ message: 'Video criado!' });
});

module.exports = router;

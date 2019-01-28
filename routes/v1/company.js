var express = require('express');
var router = express.Router();
var mysql = require(__base + '/utils/sqlUserPool');

router.use(function(req, res, next) {
  //logger.debug('Company js is working');
  next();
});

router.get('/:company_id', function(req, res) {
  //get individual company
  mysql(function(err, connection) {
    if (!err)
    {
      var post  = {company_ID: req.params.company_id};
      var query = connection.query('SELECT * FROM company_info where ?', post, function(err, rows) {
        if(!err)
        {
          logger.debug(query.sql);
          res.json(rows);
        }
        else {
          logger.debug(err);
          res.status(500).send(err);
        }
      });
      logger.debug(query.sql);
      connection.release(); //release connection
    }
    else
    {
      logger.debug(err);
    }

    });
});
router.get('/', function(req, res) {
  //get all companies
  mysql(function(err, connection) {
    if (!err)
    {
      var query = connection.query('SELECT * FROM company_info', function(err, rows) {
        if(!err)
        {
          logger.debug(query.sql);
          res.json(rows);
        }
        else {
          logger.debug(err);
          res.status(500).send(err);
        }
      });
      logger.debug(query.sql);
      connection.release(); //release connection
    }
    else
    {
      logger.debug(err);
      res.status(500).send(err);
    }

    });
});
router.delete('/:company_id', function(req, res) {
  //delete a company
  mysql(function(err, connection) {
    if (!err)
    {
      var t  = {company_ID: req.params.company_id};
      var query = connection.query('DELETE FROM company_info WHERE ?', t, function(err, rows) {
        if(!err)
        {
          logger.debug(query.sql);
          res.json(rows);
        }
        else {
          logger.debug(err);
          res.status(500).send(err);
        }
      });

      connection.release(); //release connection
    }
    else
    {
      logger.debug(err);
      res.status(500).send(err);
    }

    });
});
router.put('/:company_id', function(req, res) {
  //edit a company
  mysql(function(err, connection) {
    if (!err)
    {
      var t  = {company_ID: req.params.company_id};
      var data = req.query;
      var query = connection.query('UPDATE company_info SET ? WHERE ?', [data,t], function(err, rows) {
        if(!err)
        {
          logger.debug(query.sql);
          res.json(rows);
        }
        else {
          logger.debug(err);
          res.status(500).send(err);
        }
      });
      connection.release(); //release connection
    }
    else
    {
      logger.debug(err);
      res.status(500).send(err);
    }

    });
});

router.post('/', function(req, res) {
  //add a new company
  mysql(function(err, connection) {
      if (!err)
      {
        //get insert paramaters
        var data = req.body;
        var query = connection.query('INSERT INTO company_info SET ?', data, function(err, result) {
        if (!err)
          {
            //result.insertId --> the resultant ID
            res.json({message: result.insertId});
            logger.debug(query.sql);
            connection.release(); //release connection
          }
          else
          {
            logger.debug(err);
            res.status(500).send(err);
          }
        });
      }
      else
      {
        res.status(500).send(err);
        logger.debug(err);
      }
  });
});



router.route('/company');

module.exports = router;

var mysql = require(__base + '/utils/sqlUserPool');

//---This modules's function is to confirm whether the user logged in has access to the BR data they have requested---//
exports.brAccessAllowed = function(company_id, br_number, callback) {
    logger.debug('request BR Access....');
    mysql.getConnection(function(err, connection) {
            if (!err) {
                var query = connection.query(
                    "SELECT * FROM electronics_recycling_2.br_number where companies_idcompany = ? AND idbr_number = ?", [company_id, br_number],
                    function(err2, rows) {
                      if (!err2)
                      {
                        //If there is a match between the company id and Br number, 1 row will return
                        if (rows.length > 0)
                        {
                            return callback(null, true);
                        }
                        //If no rows return there is no match and the requested BR does not belong to the user's company
                        else {
                          return callback(null, false);
                        }
                      }
                      else {
                        return callback(err);
                      }
                        connection.release(); //release connection
                    });
            } else {
                return callback(err);
                logger.debug(err);
            }
        })
};

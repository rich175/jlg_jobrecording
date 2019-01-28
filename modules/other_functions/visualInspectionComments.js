var mysql = require(__base + '/utils/sqlUserPool');

//---This method is used to get a list of all potential Visual Inspection comments in the database---//
exports.getAllExistingComments = function(req, callback) {
    //logger.debug('request VI comments....');
    mysql.getConnection(function(err, connection) {
        if (!err) {
            var query = connection.query('SELECT * FROM visual_inspection_comments', function(err, rows) {
              connection.release(); //release connection
              //logger.debug('request VI comments complete');
              return callback(null, rows);
            });


        } else {
            return callback(err);
            logger.debug(err);

        }

    })
    //NOTE: Currently it returns a list which is then looped through, whether this is quicker than
    //asking the database for each comment is untested, but this current method is likely to be quickest
};

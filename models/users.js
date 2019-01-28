var mysql = require(__base + '/utils/sqlUserPool');
var bcrypt = require('bcrypt-nodejs');
var config = require(__base + '/config/config');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify token
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');

// REGISTER
exports.register = function(req, callback) {
    var email = req.body.USERNAME;
    var password = req.body.PASSWORD;
    var clientID = req.body.CLIENT_ID;

    // regexp from https://github.com/angular/angular.js/blob/master/src/ng/directive/input.js#L4
    var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;

    if (email || password || clientID || email.match(EMAIL_REGEXP)) {
        mysql(function(err, connection) {
            if (!err) {
                var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
                // TODO: check for duplicate users
                var validationToken = uuid.v1();
                connection.query('INSERT INTO users set ?', {
                    email: email,
                    hash: hash,
                    accountLocked: 0,
                    joinedDate: new Date().getTime(),
                    emailVerified: 0,
                    emailSignupToken: validationToken,
                    emailSignupTokenExpires: new Date().getTime() + (config.auth.emailVerifyExpiry * 1000),
                }, function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    //send email to user
                    // create reusable transporter object using the default SMTP transport
                    var transporter = nodemailer.createTransport(config.email.transport);

                    // setup e-mail data with unicode symbols
                    var mailOptions = {
                        from: '"Do Not Reply 👥" <do-not-reply@trakk-it.com>', // sender address
                        to: email, // list of receivers
                        subject: 'Trakk-IT portal registration', // Subject line
                        text: 'Please go to http://trakk-it.com/verify/' + validationToken, // plaintext body
                        html: '<b><a href="http://trakk-it.com/verify/' + validationToken + '">Please click this link to verify your account</a></b>' // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            return logger.error(error);
                        }
                        logger.info('Message sent to: ' + email + ' response: ' + info.response);
                    });

                    var userID = results.insertId.toString();

                    generateRefreshToken(userID, clientID, config.auth.defaultRefreshTokenLifetime, function(err, data) {
                        if (!err) {
                            var accessRights = {
                                'dashboard': user.dashboard,
                                'login': user.login,
                                'job_search': user.job_search,
                                'assign_job': user.assign_job,
                                'all_jobs': user.all_jobs,
                                'add_note': user.add_note,
                                'enter_work': user.enter_work,
                                'admin': user.admin,
                                'book_material': user.book_material,
                                'material_stock': user.material_stock,
                                'engineers_details': user.engineers_details,
                                'create_job': user.create_job,
                                'edit_job': user.edit_job,
                                'create_customer': user.create_customer,
                                'edit_customer': user.edit_customer,
                            };

                            logger.info('User Access For:  ' + clientID);
                            //  logger.info('@@@User:  ' + user);
                            logger.info(accessRights);
                            saveUserData({
                                currentLoginTime: new Date().getTime()
                            }, userID, function(err, data) {});
                            saveUserData({
                                currentLoginIP: req.connection.remoteAddress
                            }, userID, function(err, data) {});
                            return callback(null, {
                                ACCESS_TOKEN: generateJWT({
                                    id: userID,
                                    email: email.toString(),
                                    access: accessRights,
                                }),
                                TOKEN_TYPE: 'bearer',
                                REFRESH_TOKEN: data.refreshToken,
                                creationTimestamp: data.creationTimestamp,
                                expiresTimestamp: data.expiresTimestamp,
                            });
                        }
                    });
                });
            } else {
                return callback(new Error('MySql Connection Error'));
                // logger.debug(err);
            }
        });
        // logger.debug(query.sql);
    } else {
        return callback(new Error('Username, Password or Client ID not set / valid'));
    }
};

// Validate login
exports.login = function(req, callback) {
    var email = req.body.USERNAME;
    var password = req.body.PASSWORD;
    var clientID = req.body.CLIENT_ID;

    if (email || password || clientID) {
        logger.info('Attempted login for ' + email + ":" + clientID);


        getUserData(email, null, function(err, user) {
            if (err) {
                logger.info(email + ' - User doesn\'t exist');
                return callback(new Error('Incorrect Username or Password'));
            }
            if (user.accountLocked) {
                // Account has been disabled
                logger.info(email + ' - Account has not been disabled');
                return callback(new Error('Account Disabled'));
            }
            if (!user.emailVerified) {
                // Account has not been activated
                logger.info(email + ' - Account has not been activated');
                return callback(new Error('Account has not been activated'));
            }

            if (!bcrypt.compareSync(password, user.hash)) {
                // Passwords dont match
                logger.info('Invalid login for' + email);
                return callback(new Error('Incorrect Username or Password'));
            }
            logger.info('Login success for ' + email);
            // matched a user
            saveUserData({
                currentLoginTime: new Date().getTime()
            }, user.id, function(err, data) {});

            saveUserData({
                currentLoginIP: req.connection.remoteAddress
            }, user.id, function(err, data) {});
            // remove hashed password from user object
            var key = 'hash';
            delete user[key];
            // create refresh tokens and generate JWT
            generateRefreshToken(user.id, clientID, config.auth.defaultRefreshTokenLifetime, function(err, data) {
                if (!err) {
                    var accessRights = {
                        'dashboard': user.dashboard,
                        'login': user.login,
                        'job_search': user.job_search,
                        'assign_job': user.assign_job,
                        'all_jobs': user.all_jobs,
                        'add_note': user.add_note,
                        'enter_work': user.enter_work,
                        'admin': user.admin,
                        'book_material': user.book_material,
                        'material_stock': user.material_stock,
                        'engineers_details': user.engineers_details,
                        'create_job': user.create_job,
                        'edit_job': user.edit_job,
                        'create_customer': user.create_customer,
                        'edit_customer': user.edit_customer,
                    };

                    logger.info('User Access For:  ' + clientID);
                    //  logger.info('@@@User:  ' + user);
                    logger.info(accessRights);

                    return callback(null, {
                        ACCESS_TOKEN: generateJWT({
                            id: user.id,
                            email: email.toString(),
                            access: accessRights,
                        }),
                        TOKEN_TYPE: 'bearer',
                        REFRESH_TOKEN: data.refreshToken,
                        creationTimestamp: data.creationTimestamp,
                        expiresTimestamp: data.expiresTimestamp,
                    });
                }
                return callback(err, null);
            });
        });
    } else {
        logger.info('Incorrect Username or Password');
        return callback(new Error('Incorrect Username or Password'));
    }
};

exports.isAuthenticated = function(token, callback) {
    // check that JWT is valid, should check DB as this is a short life JWT token
    // If a user has been disabled, check this when re-authenticating with a refresh token
    jwt.verify(token, config.api.secretKey, function(err, decoded) {
        if (err) {
            return callback(false);
        }
        // valid token, return token contents
        return callback(decoded);
    });
};

exports.reAuthenticate = function(req, callback) {
    // find refresh token expiry time
    // check user is still allowed
    // generate new refresh token
    // save, hashed refresh token, clientId, creation time and expirytime to refreshtoken table
    // return nonhashed token, expiry time and clientId as JSON object

    var userID = req.body.USER_ID;
    var clientID = req.body.CLIENT_ID;
    var refreshToken = req.body.REFRESH_TOKEN;
    console.log(req.body.USER_ID + ' ' + req.body.CLIENT_ID + ' ' + req.body.REFRESH_TOKEN)
    logger.info('re-authenticating refresh token for userID ' + userID + ':' + clientID);
    if ((typeof userID !== 'undefined' && userID) || (typeof clientID !== 'undefined' && clientID) || (typeof refreshToken !== 'undefined' && refreshToken)) {
        mysql(function(err, connection) {
            if (!err) {
                var sql = 'SELECT * FROM refresh_tokens WHERE userId = ? AND clientId = ?';
                var inserts = [userID, clientID];
                sql = connection.format(sql, inserts);
                var query = connection.query(sql, function(err, results) {
                    connection.release();
                    if (err) {
                        return callback(new Error(err));
                    }
                    logger.debug(results);
                    if (results.length < 1) {
                        logger.info('No refreshtoken found for userID ' + userID + ':' + clientID);
                        return callback(new Error('No token found'));

                    }
                    var refreshData = results[0];
                    bcrypt.compare(refreshToken, refreshData.token, function(err, res) {
                        if (err) {
                            return callback(new Error(err));
                        }
                        if (res) {
                            // valid token
                            getUserData(null, userID, function(err, user) {
                                if (err) {
                                    return callback(err);
                                }
                                if (user.accountLocked) {
                                    // Account has been disabled
                                    logger.info('Account disabled ' + userID + ':' + clientID);
                                    return callback(new Error('Account Disabled'));
                                }

                                var expiredTime = new Date().getTime() + (config.auth.timeAllowance * 1000);
                                if (refreshData.expiresTimestamp > expiredTime) {
                                    generateRefreshToken(user.id, clientID, config.auth.defaultRefreshTokenLifetime, function(err, data) {
                                        if (!err) {
                                            var accessRights = {
                                                'dashboard': user.dashboard,
                                                'login': user.login,
                                                'job_search': user.job_search,
                                                'assign_job': user.assign_job,
                                                'all_jobs': user.all_jobs,
                                                'add_note': user.add_note,
                                                'enter_work': user.enter_work,
                                                'admin': user.admin,
                                                'book_material': user.book_material,
                                                'material_stock': user.material_stock,
                                                'engineers_details': user.engineers_details,
                                                'create_job': user.create_job,
                                                'edit_job': user.edit_job,
                                                'create_customer': user.create_customer,
                                                'edit_customer': user.edit_customer,
                                            };
                                            logger.info('User Access For:  ' + clientID);
                                              //logger.info('@@@User:  ' + user);
                                            logger.info(accessRights);
                                            return callback(null, {
                                                ACCESS_TOKEN: generateJWT({
                                                    id: user.id,
                                                    email: user.email.toString(),
                                                    access: accessRights,
                                                }),
                                                TOKEN_TYPE: 'bearer',
                                                REFRESH_TOKEN: data.refreshToken,
                                                creationTimestamp: data.creationTimestamp,
                                                expiresTimestamp: data.expiresTimestamp,
                                            });
                                        }
                                    });
                                } else {
                                    // Expired token
                                    deleteRefreshToken(userID, clientID, function(err, res) {
                                        if (err) {
                                            logger.debug(err);
                                        }
                                        return callback({
                                            refreshToken: 'expired'
                                        }, null);

                                    });
                                }
                            });
                        } else {
                            // token did not match
                            logger.info('Invalid refreshToken for userID ' + userID + ':' + clientID);
                            return callback({
                                refreshToken: 'Invalid Token'
                            }, null);
                        }
                    });
                });
            }
        });
    } else {
        return callback(new Error('No token found'));
    }

};

//get users
exports.getUsers = function(callback) {

    mysql(function(err, connection) {
        if (!err) {
            var sql = 'SELECT email as UserName FROM users WHERE active = 1';

            var query = connection.query(sql, function(err, results) {
                connection.release();
                if (err) {
                    return callback(new Error(err));
                } else {
                    return callback(null, results);
                }
            })
        }
    })

}

function generateJWT(data) {
    var expiresIn = config.auth.defaultAccessTokenLifetime;
    var token = jwt.sign(data, config.api.secretKey, {
        expiresIn: expiresIn
    });
    return token;
}

function generateRefreshToken(userID, clientID, tokenLifetime, callback) {
    logger.info('Generating refresh token for ' + userID + ':' + clientID);
    mysql(function(err, connection) {
        if (!err) {
            // delete a refreshtoken if it exists as we will create a new one, if the user is still valid
            deleteRefreshToken(userID, clientID, function(err, data) {
                if (err) {
                    logger.debug(err);
                }
                getUserData(null, userID, function(err, user) {
                    if (err) {
                        return callback(new Error(err));
                    }
                    //logger.info(user);
                    if (!user.accountLocked) {
                        var creationTimestamp = new Date().getTime();
                        var expiresTimestamp = creationTimestamp + (tokenLifetime * 60 * 1000);
                        var token = uuid.v1();

                        connection.query('INSERT INTO refresh_tokens set ?', {
                            token: bcrypt.hashSync(token, bcrypt.genSaltSync(10)),
                            userID: userID,
                            clientID: clientID,
                            creationTimestamp: creationTimestamp,
                            expiresTimestamp: expiresTimestamp
                        }, function(err, results) {
                            connection.release();
                            if (err) {
                                logger.debug('MySQL Error inserting refresh token');
                                return callback(err);
                            }
                            logger.info('refreshToken set for userID ' + userID + ':' + clientID);
                            return callback(null, {
                                refreshToken: token,
                                creationTimestamp: creationTimestamp,
                                expiresTimestamp: expiresTimestamp
                            });
                        });
                    } else {
                        logger.info(userID + ': Account Disabled, can\'t generate refresh token');
                        return callback(new Error('Account Disabled'), null);
                    }
                });
            });
        } else {
            return callback(err);
        }
    });
}

function deleteRefreshToken(userID, clientID, callback) {
    mysql(function(err, connection) {
        if (!err) {
            var sql = 'DELETE FROM refresh_tokens WHERE userID = ? AND clientID = ?';
            var inserts = [userID, clientID];
            sql = connection.format(sql, inserts);
            connection.query(sql, function(err, data) {
                connection.release();
                if (err) {
                    return callback(new Error(err));
                }
                return callback(null);
            });
        }
    });
}

function getUserData(email, userID, callback) {
    // get user data from either email address or userID
    mysql(function(err, connection) {
        if (err) {
            return callback(new Error(err));
        }
        var sql;
        var inserts;
        if (email) {
            sql = 'SELECT urs.*,uacc.* FROM users urs\
              LEFT JOIN companies comp\
              ON comp.idcompany = urs.companies_idcompany\
              JOIN user_access uacc\
              ON uacc.users_iduser = urs.id\
              WHERE urs.email = ?';

            inserts = [email];
        } else {
            sql = 'SELECT urs.*, uacc.* FROM users urs\
              LEFT JOIN companies comp\
              ON comp.idcompany = urs.companies_idcompany\
              JOIN user_access uacc\
              ON uacc.users_iduser = urs.id\
              WHERE urs.id = ?';

            inserts = [userID];
        }
        var query = connection.format(sql, inserts);
        connection.query(query, function(err, data) {
            connection.release();
            if (err) {
                return callback(new Error(err));
            }
            if (data.length < 1) {
                return callback(new Error('No user found'));
            }
            //logger.debug('User Reply' + data[0]);
            return callback(null, data[0]);
        });
    });
}

exports.getUserData = getUserData;



function saveUserData(data, userID, callback) {
    logger.info('Saving details to userID ' + userID);
    mysql(function(err, connection) {
        if (err) {
            return callback(new Error(err));
        }
        var sql;
        var inserts;
        connection.query('UPDATE users SET ? WHERE id = ' + userID, data, function(err, data) {
            connection.release();
            if (err) {
                logger.debug('Error saving details to userID ' + userID + 'Error: ' + err);
                return callback(new Error(err), false);
            }
            return callback(null, true);
        });
    });
}

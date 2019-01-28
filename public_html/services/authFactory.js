// based on article here
// https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec#.7pe864c9b
angular.module('auth', ['angular-jwt', 'config_module', ])

.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized',
})

.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    user: 'user',
    serverAdmin: 'serverAdmin',
})

.factory('AuthService', function($http, $state, Session, jwtHelper, settings) {
    var authService = {};

    authService.getUserNames = function(){

      return $http
          // TODO: Check login success, else throw error
          .get(settings.authUrl)
          .then(function(res) {
              if (!res.data.error) {
                  return res.data;
              } else {
                  return false;
              }
          });
    }
    authService.restoreSession = function() {
        var token = localStorage.getItem('id_token');
        var refreshToken = localStorage.getItem('r_token');
        var refreshTokenExpiry = localStorage.getItem('r_token_expiry');

        if (token && refreshToken && refreshTokenExpiry) {
            if (!jwtHelper.isTokenExpired(token)) {
                //JWT token is valid, so continue restoring User into session
                var tokenPayload = jwtHelper.decodeToken(token);

                var user = {
                    email: tokenPayload.email,
                    userId: tokenPayload.id,
                    accessRights: tokenPayload.access
                };

                Session.create(token, refreshToken, refreshTokenExpiry, user.userId);

                return user;
            } else {
                //JWT token is expired, use the refresh token to get a new one!
                //Session.create(token, refreshToken, refreshTokenExpiry, null , null);
                return false;
            }

        } else {
            return false;
        }
    };

    authService.login = function(credentials) {
        var postData = {
            USERNAME: credentials.username,
            PASSWORD: credentials.password,
            CLIENT_ID: settings.authClientID,
            GRANT_TYPE: 'PASSWORD'
        };
        return $http
            // TODO: Check login success, else throw error
            .post(settings.authUrl, postData)
            .then(function(res) {
                if (!res.data.error) {
                    var tokenPayload = jwtHelper.decodeToken(res.data.ACCESS_TOKEN);

                    var user = {
                        email: tokenPayload.email,
                        userId: tokenPayload.id,
                        accessRights: tokenPayload.access
                    };

                    Session.create(res.data.ACCESS_TOKEN, res.data.REFRESH_TOKEN,
                        res.data.expiresTimestamp, user.userId);

                    //put token into storage
                    localStorage.setItem('id_token', res.data.ACCESS_TOKEN);
                    localStorage.setItem('r_token', res.data.REFRESH_TOKEN);
                    localStorage.setItem('r_token_expiry', res.data.expiresTimestamp);
                    //localStorage.setItem('r_token_access', JSON.stringify(res.data.access));

                    return user;
                } else {
                    return false;
                }
            });
    };
    authService.checkJWT = function() {
        //check expiry and if expired or near expired, refresh it

    }
    authService.refreshJWT = function() {
        //use refreshtoken to get new valid JWT

    }


    authService.logout = function(credentials) {
        Session.destroy();
        console.log('Logged Out');
        localStorage.removeItem('id_token');
        localStorage.removeItem('r_token');
        localStorage.removeItem('r_token_expiry');
    };

    authService.isAuthenticated = function() {
        return !!Session.userId;
    };

    /*authService.isAuthorized = function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
    };*/

    authService.isAuthorized = function(pageIdentifier) {
        var token = localStorage.getItem('id_token');
        var tokenPayload = jwtHelper.decodeToken(token);
        var userID = tokenPayload.id;

        var accessRights = tokenPayload.access;

        var access = accessRights[pageIdentifier];

        return access;
    };

    authService.register = function(credentials) {
        var postData = {
            USERNAME: credentials.username,
            PASSWORD: credentials.password,
            CLIENT_ID: settings.authClientID
        };
        return $http
            // TODO: Check register success, else throw error
            .post(settings.authUrl + 'register', postData)
            .then(function(res) {
                if (!res.data.error) {
                    return true;
                } else {
                    return false;
                }
            });
    }

    return authService;
})

.factory('authInterceptor', function($injector, Session, $rootScope, $q) {
    return {
        request: function(config) {
            if (config.url.indexOf('.html') == -1 && config.url.indexOf('.js') == -1) {
                config.headers = config.headers || {};
                if (Session.jwt) {
                    config.headers['x-access-token'] = Session.jwt;
                }
            }
            return config;
        },
        response: function(response) {
            if (response.status == 200) {
                //successful web calls here
            }
            return response || $q.when(response);
        },
        responseError: function(response, $state) {
            if (response.status == 401) {
                console.log('Please login again');
                $injector.get('$state').transitionTo('login');
            } else if (response.status == 403) {
                console.log('Not authorised here!');
            } else if (response.status == 500) {
                console.log('Server Error');
            }
            return $q.reject(response);
        }
    };
})

.config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
})

.service('Session', function() {
    this.create = function(JWT, REFRESH_TOKEN, expiresTimestamp, userId) {
        this.jwt = JWT;
        this.refreshToken = REFRESH_TOKEN;
        this.expiresTimestamp = expiresTimestamp;
        this.userId = userId;
    };
    this.destroy = function() {
        this.jwt = null;
        this.refreshToken = null;
        this.expiresTimestamp = null;
        this.userId = null;

    };
})

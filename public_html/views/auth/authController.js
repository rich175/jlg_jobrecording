angular.module('authHelper', [])
    .controller('loginController', function($state, $scope, $rootScope, AUTH_EVENTS, AuthService) {
        $scope.loginSuccess = false;
        $scope.loginFailed = false;
        $scope.availableUsers = {};
        $scope.selectedUsername = {};
        $scope.users = function() {
            AuthService.getUserNames().then(function(users) {
                $scope.availableUsers = users;
            })
        };
        $scope.users();
        $scope.login = function() {
            var credentials = {};
            credentials.password = 'password';
            credentials.username = $scope.selectedUsername.UserName;
            AuthService.login(credentials).then(function(user) {
                if (user) {
                    //correct username and password
                    $scope.loginSuccess = true;
                    $scope.loginFailed = false;
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    $rootScope.setCurrentUser(user);
                    $state.go('index.jobSearch');
                } else {
                    $scope.loginFailed = true;
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                }
            });
        }
    })
    .directive('formAutofillFix', function($timeout) {
        return function(scope, element, attrs) {
            element.prop('method', 'post');
            if (attrs.ngSubmit) {
                $timeout(function() {
                    element
                        .unbind('submit')
                        .bind('submit', function(event) {
                            event.preventDefault();
                            element
                                .find('input, textarea, select')
                                .trigger('input')
                                .trigger('change')
                                .trigger('keydown');
                            scope.$apply(attrs.ngSubmit);
                        });
                });
            }
        };
    })
    .controller('registerController', function($state, $scope, $rootScope, AUTH_EVENTS, AuthService) {
        $scope.register = function(credentials) {
            AuthService.register(credentials).then(function(success) {
                if (success) {
                    $scope.success = true;
                    $state.go('emailed');
                } else {

                    $scope.error = true;
                }

            });
        };
    });

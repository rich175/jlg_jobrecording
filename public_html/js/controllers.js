/**
 * INSPINIA - Responsive Admin Theme
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl($rootScope, USER_ROLES, AuthService) {
  //global application scope for authentication stuff
  $rootScope.currentUser = null;
  $rootScope.userRoles = USER_ROLES;
  $rootScope.isAuthorized = AuthService.isAuthorized;
  $rootScope.setCurrentUser = function (user) {
    $rootScope.currentUser = user;
  };
};

function logutCtrl($rootScope, $state, $scope, AuthService) {
  //global application scope for authentication stuff
  $scope.logout = function () {
    AuthService.logout();
    $state.go('login');
  };
};

angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)
    .controller('logutCtrl', logutCtrl)

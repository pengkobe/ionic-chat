
angular.module('login.controller', [])
  .controller('LoginController', LoginController)
  .controller('RegisterController', RegisterController)

function LoginController($scope, $ionicPopup, $rootScope, $ionicLoading, $state) {
  $scope.submitting = false;
  $scope.user = {};
  $scope.validateOptions = {
    blurTrig: false,
    showError: false,
    removeError: false
  };

  $scope.login = function () {
    $state.go('tab.chat');
  };
}

LoginController.$inject = ['$scope', '$ionicPopup', '$rootScope', '$ionicLoading', '$state'];

function RegisterController($scope, $ionicPopup, $rootScope, $ionicBackdrop, $ionicHistory) {
  $scope.submitting = false;
  $scope.smsCodeText = '免费获取';
  $scope.smsCodeStatus = false;
  $scope.user = {};
  $scope.validateOptions = {
    blurTrig: false,
    showError: false,
    removeError: false
  };

  $scope.register = function () {
    $scope.submitting = true;
    $scope.user.nick_name = $scope.user.username;
  };

  $scope.goBack = function () {
    $ionicHistory.goBack(-1);
  }
}
RegisterController.$inject = ['$scope', '$ionicPopup', '$rootScope', '$ionicBackdrop', '$ionicHistory'];

angular.module('login.controller', [])
  .controller('LoginController', LoginController)
  .controller('RegisterController', RegisterController)

function LoginController($scope, $rootScope, $ionicLoading, $state, LOGIN_URL, HttpPromiseService,currentUser) {
  $scope.submitting = false;
  $scope.user = {};
  $scope.validateOptions = {
    blurTrig: false,
    showError: false,
    removeError: false
  };

  $scope.login = function () {
    var params = {
      username: $scope.user.username,
      password: $scope.user.password
    };
    HttpPromiseService.getData(LOGIN_URL, params).then(function (data) {
      console.log(data);
      if (data.state = 1) {
        currentUser.setUserinfo(data.user);
        $state.go('tab.chat');
      } else {
        alert("登录失败");
      }
    });
  };
}

LoginController.$inject = ['$scope', '$rootScope', '$ionicLoading', '$state', 'LOGIN_URL', 'HttpPromiseService','currentUser'];

function RegisterController($scope, $rootScope, $ionicBackdrop, $ionicHistory,REGISTER_URL,HttpPromiseService) {
  $scope.submitting = false;
  $scope.user = {};
  $scope.validateOptions = {
    blurTrig: false,
    showError: false,
    removeError: false
  };

  $scope.register = function () {
    $scope.submitting = true;
    var params = {
      username: $scope.user.username,
      password: $scope.user.password,
      nickname: $scope.user.username
    };
     HttpPromiseService.getData(REGISTER_URL, params).then(function (data) {
      console.log(data);
      if (data.state = 1) {
        alert("注册成功！");
        $state.go('login');
      } else {
        alert("注册失败");
      }
    });
  };

  $scope.goBack = function () {
    $ionicHistory.goBack(-1);
  }
}
RegisterController.$inject = ['$scope', '$rootScope', '$ionicBackdrop', '$ionicHistory','REGISTER_URL','HttpPromiseService'];

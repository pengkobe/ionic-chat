/**
 * Created by superman on 2016/6/8.
 */
(function () {
  'use strict';
  angular.module('com.tm.app.login.controller', [])
    .controller('LoginController', LoginController)
    .controller('LoginModalController', LoginModalController)
    .controller('RegisterController', RegisterController)
    .controller('ResetPasswordController', ResetPasswordController);

  function LoginController($scope, $ionicPopup, LoginService, Passport, $rootScope, $ionicLoading) {
    $scope.submitting = false;
    $scope.user = {};
    $scope.validateOptions = {
      blurTrig: false,
      showError: false,
      removeError: false
    };

    $scope.login = function () {
      LoginService.login($scope.user).then(function (data) {
          console.log('success');
          Passport.setPassport(data.data);
          $rootScope.$broadcast('user:login');
        }, function (err) {
          console.log('err');
          var myPopup = $ionicPopup.show({
            title: err.msg,
            scope: $scope,
            buttons: [
              {
                text: '确认',
                type: 'button-clear button-assertive',
              },
            ]
          });
          myPopup.then(function (res) {
            $scope.user.password = '';
          })
        })
        .finally(function () {
          console.log('finally');
          $scope.submitting = false;
        })
    };


  }

  LoginController.$inject = ['$scope', '$ionicPopup', 'LoginService', 'Passport', '$rootScope', '$ionicLoading'];

  function LoginModalController($scope, $ionicPopup, LoginService, Passport, ModalService, $rootScope) {
    $scope.submitting = false;
    $scope.user = {};
    $scope.validateOptions = {
      blurTrig: false,
      showError: false,
      removeError: false
    };

    $scope.login = function () {
      $scope.submitting = true;
      LoginService.login($scope.user).then(function (data) {
        Passport.setPassport(data.data);
        $scope.closeModal({'login': true});
        //$rootScope.$broadcast('user:login');
      }, function (err) {
        console.log('err');
        var myPopup = $ionicPopup.show({
          title: err.msg,
          scope: $scope,
          buttons: [
            {
              text: '确认',
              type: 'button-clear button-assertive',
            },
          ]
        });
        myPopup.then(function (res) {
          $scope.user.password = '';
        })
      }).finally(function () {
        $scope.submitting = false;
      })

    };

    // 监听注册成功事件
    $rootScope.$on('user:register', function () {
      $scope.closeModal({'login': true});
    });

    $scope.openResetPwdModal = function () {
      ModalService.show('main/common/component/reset-password-modal.html', 'ResetPasswordController')
        .then(function (data) {

        });
    };

    $scope.openRegisterModal = function () {
      ModalService.show('main/common/component/register-modal.html', 'RegisterController')
        .then(function (data) {

        });
    };

  }

  LoginModalController.$inject = ['$scope', '$ionicPopup', 'LoginService', 'Passport', 'ModalService', '$rootScope'];

  function RegisterController($scope, $ionicPopup, LoginService, Passport, $rootScope, $timeout, $ionicBackdrop, $ionicHistory) {
    $scope.submitting = false;
    $scope.smsCodeText = '免费获取';
    $scope.smsCodeStatus = false;
    $scope.user = {};
    $scope.validateOptions = {
      blurTrig: false,
      showError: false,
      removeError: false
    };
    var time = 60,
      timer;

    var smsCodeLoad = function (time) {
      if (time == 0) {
        $scope.smsCodeText = '免费获取';
        $scope.smsCodeStatus = false;
      }
      else {
        $scope.smsCodeText = time + '秒后重发';
        $scope.smsCodeStatus = true;
        time--;
        timer = $timeout(function () {
          smsCodeLoad(time)
        }, 1000);
      }
    };

    $scope.getSmsCode = function () {
      var error = '';
      if (angular.isUndefined($scope.user.username)) {
        error = '手机号码不能为空';
      }
      else if (new RegExp('/1[3|4|5|7|8|][0-9]{9}/').test($scope.user.username)) {
        error = '请输入正确的手机号码';
      }
      else {
        LoginService.registerSms($scope.user.username)
          .then(function () {
            $scope.smsCodeStatus = true;
            smsCodeLoad(time);
          }, function (err) {
            var smsErrorPopup = $ionicPopup.show({
              title: err.msg,
              scope: $scope,
              buttons: [
                {
                  text: '确认',
                  type: 'button-clear button-assertive',
                },
              ]
            });
          })
      }

      if (error != '') {
        var errorPopup = $ionicPopup.show({
          title: error,
          scope: $scope,
          cssClass: 'errorPopup'
        });
        $ionicBackdrop.release();

        $timeout(function () {
          errorPopup.close();
        }, 2000);
      }
    };

    $scope.register = function () {
      $scope.submitting = true;
      $scope.user.nick_name = $scope.user.username;
      LoginService.register($scope.user).then(function (data) {
        $timeout.cancel(timer);
        Passport.setPassport(data.data);
        $scope.user = {};
        $rootScope.$broadcast('user:register');
        $scope.closeModal();
      }, function (err) {
        var errorPopup = $ionicPopup.show({
          title: err.msg,
          scope: $scope,
          buttons: [
            {
              text: '确认',
              type: 'button-clear button-assertive',
            },
          ]
        });
        errorPopup.then(function (res) {
          $scope.user.password = '';
        })
      }).finally(function () {
        $scope.submitting = false;
      })
    };

    $scope.goBack = function () {
      $ionicHistory.goBack(-1);
    }
  }

  RegisterController.$inject = ['$scope', '$ionicPopup', 'LoginService', 'Passport', '$rootScope', '$timeout', '$ionicBackdrop', '$ionicHistory'];

  function ResetPasswordController($scope, $ionicPopup, LoginService, $timeout, $ionicBackdrop, $state, PopupService) {
    $scope.submitting = false;
    $scope.smsCodeText = '免费获取';
    $scope.smsCodeStatus = false;
    $scope.user = {};
    $scope.validateOptions = {
      blurTrig: false,
      showError: false,
      removeError: false
    };
    var time = 60,
      timer;
    var smsCodeLoad = function (time) {
      if (time == 0) {
        $scope.smsCodeText = '验证码';
        $scope.smsCodeStatus = false;
      }
      else {
        $scope.smsCodeText = time + '秒后重发';
        $scope.smsCodeStatus = true;
        time--;
        $timeout(function () {
          smsCodeLoad(time)
        }, 1000);
      }
    };

    $scope.getSmsCode = function () {
      var error = '';
      if (angular.isUndefined($scope.user.username)) {
        error = '手机号码不能为空';
      }
      else if (new RegExp('/1[3|4|5|7|8|][0-9]{9}/').test($scope.user.username)) {
        error = '请输入正确的手机号码';
      }
      else {
        LoginService.resetPasswordSms($scope.user.username)
          .then(function () {
            $scope.smsCodeStatus = true;
            smsCodeLoad(time);
          }, function (err) {
            var smsErrorPopup = $ionicPopup.show({
              title: err.msg,
              scope: $scope,
              buttons: [
                {
                  text: '确认',
                  type: 'button-clear button-assertive',
                },
              ]
            });
          })
      }

      if (error != '') {
        var errorPopup = $ionicPopup.show({
          title: error,
          scope: $scope,
          cssClass: 'errorPopup'
        });
        $ionicBackdrop.release();

        $timeout(function () {
          errorPopup.close();
        }, 2000);
      }
    };

    $scope.reset = function () {
      $scope.submitting = true;
      LoginService.resetPassword($scope.user).then(function (data) {
        $timeout.cancel(timer);
        $state.go('footer.index');
        $scope.user = {};
        var json = {
          title: '密码修改成功'
        };
        PopupService.confirmToast(json, $scope).then(function () {
          $scope.closeModal()
        })
      }, function (err) {
        var errorPopup = $ionicPopup.show({
          title: err.msg,
          scope: $scope,
          buttons: [
            {
              text: '确认',
              type: 'button-clear button-assertive',
            },
          ]
        });
        errorPopup.then(function (res) {
          $scope.user.new_password = '';
          $scope.user.re_new_password = '';
        })
      }).finally(function () {
        $scope.submitting = false;
      })
    }
  }

  ResetPasswordController.$inject = ['$scope', '$ionicPopup', 'LoginService', '$timeout', '$ionicBackdrop', '$state', 'PopupService'];
})();

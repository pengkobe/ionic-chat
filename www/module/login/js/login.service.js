/**
 * Created by superman on 2016/6/12.
 */
(function () {
  'use strict';
  angular.module('com.tm.app.login.service', [])
    .factory('ResponseService', ['PopupService', function (PopupService) {
      function handle401(scope) {
        var json = {
          title: '登录提示',
          subTitle: '您的账户在别的设备登录，请重新登录',
          btn1: {
            text: '取消',
            action: 'cancel'
          },
          btn2: {
            text: '登录',
            action: 'login'
          }
        };
        PopupService.confirmShow(json, scope).then(function (data) {
          if (data == 'cancel') {

          }
        });

        PopupService.confirmToast({title: '您的账户在别的设备登录，请重新登录'})
      }

      return {
        handle401: handle401
      }

    }])
    .factory('LogoutService', ['Passport', '$state', '$ionicHistory', function (Passport, $state, $ionicHistory) {
      var _logout = function () {
        Passport.logout();
        $ionicHistory.clearHistory();
        $state.go('footer.index');
      };

      var _logoutFormPwd = function () {
        Passport.logout();
        $ionicHistory.clearHistory();
        $state.go('footer.account');
      };
      return {
        logout: _logout,
        logoutFormPwd: _logoutFormPwd
      }
    }])
    .factory("LoginService", ["$http", "Services", "EncryptService", '$q', function ($http, Services, EncryptService, $q) {
      var _login = function (user) {
        var deferred = $q.defer();
        user.password = EncryptService.rsa_encrypt(user.password);
        $http({method: 'POST', url: Services.LOGIN.url, data: user}).success(function (data) {
          deferred.resolve(data);
        }).error(function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      };

      var _logout = function () {
        var deferred = $q.defer();
        $http({method: 'POST', url: Services.LOGOUT.url}).success(function (data) {
            deferred.resolve(data);
          })
          .error(function (err) {
            deferred.reject(err);
          });
        return deferred.promise;
      };

      var _registerSms = function (mobile) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          url: Services.REGISTER_SMS.url,
          data: {"mobile": mobile}
        }).success(function (data) {
            deferred.resolve(data);
          })
          .error(function (err) {
            deferred.reject(err);
          });
        return deferred.promise;
      };

      var _register = function (user) {
        var deferred = $q.defer();
        user.password = EncryptService.rsa_encrypt(user.password);
        $http({method: 'POST', url: Services.REGISTER.url, data: user})
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function (err) {
            deferred.reject(err);
          });
        return deferred.promise;
      };

      var _resetPasswordSms = function (mobile) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          url: Services.SMS_RESET_PASSWORD.url,
          data: {"mobile": mobile}
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      };
      var _resetPassword = function (user) {
        var deferred = $q.defer();
        user.new_password = EncryptService.rsa_encrypt(user.new_password);
        $http({
          method: 'POST',
          url: Services.RESET_PASSWORD.url,
          data: user
        })
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function (err) {
            deferred.reject(err);
          });
        return deferred.promise;
      };
      return {
        login: _login,
        logout: _logout,
        registerSms: _registerSms,
        register: _register,
        resetPasswordSms: _resetPasswordSms,
        resetPassword: _resetPassword
      };
    }]);

})();

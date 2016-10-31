  angular.module('login.service', [])
    .factory('LogoutService', ['$state', '$ionicHistory', 
    function ( $state, $ionicHistory) {
      var _logout = function () {
        $ionicHistory.clearHistory();
        $state.go('tab.login');
      };
      return {
        logout: _logout,
      }
    }])
    .factory("LoginService", ["$http", "Services", '$q', 
    function ($http, Services,$q) {
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
      return {
        login: _login,
        logout: _logout,
        registerSms: _registerSms,
        register: _register
      };
    }]);

angular.module('login.service', [])
  .service("UserService", function (CacheFactory, $rootScope) {
    var userinfo = null;
    var userservive = {
      getUserinfo: function () {
        if (userinfo == null) {
          var mockdata = {
            "_id": "5812ebdf4c0b0e79324f6cb1", "nickname": "yipeng", "username": "py",
            "password": "123", "headimg": "", "EMail": "yipeng.info@gmail.com",
          };
          userinfo = mockdata;
        }
        return userinfo;
      },
      setUserinfo: function (val) {
        userinfo = val;
        return;
      }
    }
    return userservive;
  })

  .factory('LogoutService', ['$state', '$ionicHistory',
    function ($state, $ionicHistory) {
      var _logout = function () {
        $ionicHistory.clearHistory();
        $state.go('login');
      };
      return {
        logout: _logout,
      }
    }]);

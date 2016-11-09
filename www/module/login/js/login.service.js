angular.module('login.service', [])
  /**
   * 用户全局引用
   */
  .service("currentUser", function (CacheFactory, $rootScope) {
    var userinfo = null;
    var userservive = {
      getUserinfo: function () {
        if (userinfo == null) {
          var mockdata = {
            "_id": "5812ebdf4c0b0e79324f6cb1", "nickname": "彭奕", "username": "py",
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
        $state.go('tab.login');
      };
      return {
        logout: _logout,
      }
    }]);

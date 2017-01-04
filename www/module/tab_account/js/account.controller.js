angular.module('account', [])
  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
    /**
     * 退出app(在安卓手机上有用) 
     **/
    $scope.exit = function () {
      CacheFactory.removeAll();
      ionic.Platform.exitApp();
    };
  });

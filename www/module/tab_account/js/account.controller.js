angular.module('account', [])
  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
    // for android
    $scope.exit = function () {
      CacheFactory.removeAll();
      ionic.Platform.exitApp();
    };
  });

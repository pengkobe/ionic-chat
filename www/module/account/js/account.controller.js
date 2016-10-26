angular.module('account', ['account.servive'])
  .controller('AccountCtrl', function ($scope, AddNewUserService, AddNewGroupService) {
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

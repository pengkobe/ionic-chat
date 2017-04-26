angular
  .module("account", [])
  .controller("AccountCtrl", function($scope, UserService) {
    var userinfo = UserService.getUserinfo();
    $scope.userinfo = userinfo;
    $scope.settings = {
      enableFriends: true
    };

    // for android
    $scope.exit = function() {
      CacheFactory.removeAll();
      ionic.Platform.exitApp();
    };

    $scope.SwitchAccount = function(){
        
    }

  });

angular
  .module("account", [])
  .controller("AccountCtrl", function(
    $scope,
    UserService,Friends,findTeamsReq,
    $state,
    $ionicHistory
  ) {
    var userinfo = UserService.getUserinfo();
    $scope.userinfo = userinfo;
    $scope.settings = {
      enableFriends: true
    };

    // just for android
    $scope.exit = function() {
      CacheFactory.removeAll();
      ionic.Platform.exitApp();
    };

    /**
     * 切换账户
     */
    $scope.SwitchAccount = function() {
      Friends.stopReq();
      findTeamsReq.stopReq();
      $ionicHistory.clearHistory();
      $state.go("login");
    };
  });

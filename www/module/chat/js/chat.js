/**
 * chat模块服务
 */
; angular.module('chat', ['chat.services'])
  .config(function (SignalingProvider) {
    // 视频服务服务端配置
    SignalingProvider.setBackendUrl("http://115.29.51.196:5000/chat");
  })
  /**
   * 服务初始化
   * @param  {[Object]} Signaling [socket.io实例]
   */
  .run(function(Signaling){ 

  })
  .controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })


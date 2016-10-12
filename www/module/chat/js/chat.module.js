/**
 * chat模块服务
*/

var chat_modules=['chat.route','chat.controllers','chat.services','chat.directive','chat.filter'];
chat_modules.concat(["chat.call"]);
; angular.module('chat', chat_modules)
  .config(function (SignalingProvider) {
    // 视频服务服务端配置
    SignalingProvider.setBackendUrl("http://115.29.51.196:5000/chat");
  })
  /**
   * 服务初始化
   * @param  {[Object]} $state [跳转服务]
   * @param  {[Object]} Signaling [socket.io实例]
   * @param  {[Object]} $ionicLoading [加载中弹层]
   * @param  {[Object]} $rootScope [全局scope]
   * @param  {[Object]} newMessageEventService [新消息事件服务]
   */
  .run(function ($state, Signaling, $ionicLoading, $rootScope, newMessageEventService) {
    /// ==== 全局监听消息(BEGIN) ====
    var chMsg = function (newValue, oldValue) {
      if (newValue !== oldValue) {
        var jsonMsg = newValue.pop();
        if (typeof jsonMsg !== "undefined" && jsonMsg !== "undefined") {
          newMessageEventService.broadcast(jsonMsg);
        }
      }
    };
    // watch items的变化
    var listener = $rootScope.$watch('arrMsgs', chMsg, true);
    // $scope.$on('$destroy', function () {
    //   console.log('destroy');
    //   listener();
    // });
    /// ==== 全局监听消息(END) ====

    Signaling.on('messageReceived', function (name, message, Signaling) {
      switch (message.type) {
        case 'call':
          if ($state.current.name === 'call') {
            Signaling.emit('sendMessage', name, { type: 'callInProgress' });
            return;
          }
          // alert('收到视频通话请求，准备跳转！' + message.type);
          $state.go('call', { isCalling: false, contactName: name });
          break;
      }
    });
  });
 


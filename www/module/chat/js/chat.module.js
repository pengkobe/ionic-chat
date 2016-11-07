/**
 * chat模块服务
*/
var chat_modules = ['chat.route', 'chat.controllers', 'chat.services', 'chat.directive', 'chat.filter'];
chat_modules.concat(["chat.call"]);
angular.module('chat', chat_modules)
  // 视频服务配置
  .config(function (SignalingProvider, VEDIO_CHAT_URL) {
    SignalingProvider.setBackendUrl(VEDIO_CHAT_URL);
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
    Signaling.on('messageReceived', function (name, message, Signaling) {
      switch (message.type) {
        case 'call':
          if ($state.current.name === 'call') {
            Signaling.emit('sendMessage', name, { type: 'callInProgress' });
            return;
          }
          $state.go('call', { isCalling: false, contactName: name });
          break;
      }
    });
  });



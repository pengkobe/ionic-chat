angular
  .module("chat.controllers")
  .controller("groupInfoCtrl", function(
    $scope,
    Groups,
    $state,
    $stateParams,
    RequestUrl
  ) {
    $scope.Target = Groups.get($stateParams.targetId);
    var targetId = $stateParams.targetId;
    var targetName = $stateParams.targetName;
    var conversationType = $stateParams.conversationType;

    // 发送群消息
    $scope.sendMsg = function() {
      $state.go("tab.chatDetail", {
        name: targetName,
        targetId: targetId,
        conversationType: conversationType
      });
    };
    // 添加群成员
    $scope.addGroupmember = function() {
      $state.go("tab.addGroupmember", { GroupID: targetId });
    };
    $scope.members = [];
    function getGroupMem() {
      Groups.getGroupMembers(targetId, callback);
      function callback(members) {
        if (members && members.length) {
          var length = members.length;
          $scope.Target.number = length;
          for (var i = 0; i < length; i++) {
            var obj = {};
            var temdata = members[i];
            obj.id = temdata._id;
            obj.name = temdata.nickname;
            obj.portrait = temdata.headimg
              ? RequestUrl + "Images/Photo/" + temdata.headimg
              : null;
            $scope.members.push(obj);
          }
        }
      }
    }
    // 获取群组成员
    getGroupMem();
  });

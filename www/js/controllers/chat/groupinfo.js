angular.module('starter.controllers')
.controller('groupInfoCtrl', function ($scope, Groups, $state,
        $stateParams, CacheFactory, getGroupMembers, projectTeam, RequestUrl,currentUser) {
        $scope.Target = Groups.get($stateParams.targetId);
        var targetId = $stateParams.targetId;
        var targetName = $stateParams.targetName;
        var conversationType = $stateParams.conversationType;
        var groupType = $stateParams.groupType;
        // 发送群消息
        $scope.sendMsg = function () {
            // alert('p y is here ready to home:'+$stateParams.targetId+":"+$stateParams.conversationType);
            $state.go('EFOS.chatDetail', { name: targetName, targetId: targetId, conversationType: conversationType });
        }
        // 添加群成员
        $scope.addTeammate = function () {
            $state.go('EFOS.addTeammate', { GroupID: targetId });
        }
        $scope.members = [];
        function getGroupMem() {
            if (groupType == "create") {
                getGroupMembers(targetId.substr(4), callback);
            }
            else {
                var projectCode = currentUser.getUserinfo().PCode;
                projectTeam(projectCode, callback);
            }
            function callback(data) {
                debugger;
                var data = data.data;
                var length = data.length;
                $scope.Target.number = length;
                for (var i = 0; i < length; i++) {
                    var obj = {};
                    var temdata = data[i];
                    obj.id = temdata.UserID;
                    obj.name = temdata.UserName;
                    obj.portrait = temdata.headimgurl ? RequestUrl + 'Images/Photo/' + temdata.headimgurl : null;
                    $scope.members.push(obj);
                }
            }
        }
        // 获取群组成员
        getGroupMem();
    });
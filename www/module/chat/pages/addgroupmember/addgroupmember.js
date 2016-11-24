/**
 * 待测
 */

angular.module('chat.controllers')
    .controller('addGroupmember', function ($scope, $stateParams,
        $ionicPopup, $cordovaContacts, $ionicHistory, myNote, $timeout,
        Friends, Groups, AddGroupRequest) {
        var GroupID = $stateParams.GroupID;
        var group = {};

        // 获取好友列表
        Friends.all(function (frns) {
            var grp = Groups.getGroupMembers(GroupID, function (members) {
                for (var i = 0; i < frns.length; i++) {
                    frns[i].MemberID = "";
                    for (var j = 0; j < members.length; j++) {
                        if (frns[i].id == members[j]._id) {
                            frns[i].checked = true;
                            frns[i].MemberID = "123";
                        }
                    }
                }
                $scope.friends = frns;
            });
        });

        // 提交
        $scope.sure = function () {
            var members = [];
            angular.forEach($scope.friends, function (data) {
                if (!!data.checked && data.MemberID == "") {
                    members.push(data.id);
                }
            });
            addGroupMember(members);
        };

        // 发送入群请求
        function addGroupMember(members) {
            for (var j = 0; j < members.length; j++) {
                // userid，frindid，groupid， 
                AddGroupRequest(members[i], GroupID, function (data) {
                    alert("请求好友们入群发送成功！");
                });
            }
        }
    })
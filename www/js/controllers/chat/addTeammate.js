angular.module('starter.controllers')
 .controller('addTeammateCtrl', function ($scope, RequestUrl, CacheFactory, $stateParams,
        $ionicPopup, HttpFactory, $cordovaContacts, $ionicHistory, myNote, $timeout) {
        var cache = angular.fromJson(CacheFactory.get('UserAccount'));
        var UserID = cache.UserID;
        var GroupID = $stateParams.GroupID;
        var task = {};

        HttpFactory.send({
            url: RequestUrl + 'Action.ashx?Name=HYD.E3.Business.UserInfo_newBLL.getTeammate',
            data: {
                UserID: UserID,
                GroupID: GroupID.substr(4)
            },
            method: 'post'
        }).then(function (data) {
            //MemberID  debugger;
            $scope.friends = data.data.data;
        });

        // 提交
        $scope.sure = function () {
            // console.log($scope.friends);
            task.member = [];
            angular.forEach($scope.friends, function (data) {
                if (!!data.checked && data.MemberID == "") {
                    task.member.push(data.UserID);
                }
            });
            addTeammate(task);
        };

        function addTeammate(team) {
            HttpFactory.send({
                url: RequestUrl + 'Action.ashx?Name=HYD.E3.Business.UserInfo_newBLL.addTeammate',
                data: {
                    UserID: UserID,
                    GroupID: GroupID.substr(4),
                    members: angular.toJson(team.member)
                },
                method: 'post'
            }).then(function () {
                myNote.myNotice('邀请成功！', 3000);
                $timeout(function () {
                    $ionicHistory.goBack();
                }, 3000);
            });
        }
    })
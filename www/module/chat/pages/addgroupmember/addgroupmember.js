angular.module('chat.controllers')
 .controller('addGroupmember', function ($scope, RequestUrl, CacheFactory, $stateParams,
        $ionicPopup, HttpFactory, $cordovaContacts, $ionicHistory, myNote, $timeout) {
        var UserID = cache.UserID;
        var GroupID = $stateParams.GroupID;
        var task = {};

        // HttpFactory.send({
        //     url: RequestUrl + '',
        //     data: {
        //         UserID: UserID,
        //         GroupID: GroupID.substr(4)
        //     },
        //     method: 'post'
        // }).then(function (data) {
        //     //MemberID  debugger;
        //     $scope.friends = data.data.data;
        // });

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
            // HttpFactory.send({
            //     url: RequestUrl + '',
            //     data: {
            //         UserID: UserID,
            //         GroupID: GroupID.substr(4),
            //         members: angular.toJson(team.member)
            //     },
            //     method: 'post'
            // }).then(function () {
            //     myNote.myNotice('邀请成功！', 3000);
            //     $timeout(function () {
            //         $ionicHistory.goBack();
            //     }, 3000);
            // });
        }
    })
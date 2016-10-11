angular.module('chat.controllers')
 .controller('addTeamCtrl', function ($scope, RequestUrl, CacheFactory, $ionicPopup, HttpFactory, 
    $ionicHistory,$cordovaContacts, myNote, $timeout) {
        var cache = angular.fromJson(CacheFactory.get('UserAccount'));
        $scope.task = {};
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="task.title">',
            title: '输入组名：', // 创建项目组
            scope: $scope,
            buttons: [
                {
                    text: '取消',
                    onTap: function (e) {
                        $ionicHistory.goBack(-1);
                    }
                },
                {
                    text: '<b>保存</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.task.title) {
                            myNote.myNotice('组名不能为空！', 3000);
                            e.preventDefault();
                        }
                    }
                }
            ]
        });
        myPopup.then(function () {
            myPopup.close();
        });
        HttpFactory.send({
            url: RequestUrl + 'Action.ashx?Name=HYD.E3.Business.UserInfo_newBLL.getFriends',
            data: {
                UserID: cache.UserID
            },
            method: 'post'
        }).then(function (data) {
            $scope.friends = data.data.data;
        });
        $scope.sure = function () {
            console.log($scope.friends);
            $scope.task.member = [];
            angular.forEach($scope.friends, function (data) {
                if (!!data.checked) {
                    $scope.task.member.push(data.UserID);
                }
            });
            createTeam($scope.task);
        };

        function createTeam(team) {
            HttpFactory.send({
                url: RequestUrl + 'Action.ashx?Name=HYD.E3.Business.UserInfo_newBLL.createGroup',
                data: {
                    title: team.title,
                    UserID: cache.UserID,
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

        $scope.getAllContacts = function () {
            var options = {};
            options.multiple = true;
            $cordovaContacts.find(options).then(function (allContacts) { 
                //omitting parameter to .find() causes all contacts to be returned
                $scope.contacts = allContacts;
                alert(angular.toJson($scope.contacts[0]));
            }, function (err) {
                alert(err);
            });
        };
    })
    ;
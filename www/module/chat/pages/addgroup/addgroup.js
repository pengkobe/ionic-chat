angular.module('chat.controllers')
    .controller('addGroupCtrl', function ($scope, RequestUrl, $ionicPopup, HttpFactory,
        $ionicHistory, $cordovaContacts, myNote, $timeout, Friends, CreateGroups) {
        $scope.group = {};
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="group.name">',
            title: '输入组名：',
            scope: $scope,
            buttons: [{
                text: '取消',
                onTap: function (e) {
                    $ionicHistory.goBack(-1);
                }
            }, {
                text: '<b>保存</b>',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.group.name) {
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
        Friends.all(function (friends) {
            for (var i = 0; i < friends.length; i++) {
                friends[i].checked = false;
            }

            $scope.friends = friends;
        });

        $scope.sure = function () {
            console.log("$scope.friends:", $scope.friends);
            $scope.group.member = [];
            angular.forEach($scope.friends, function (data) {
                if (!!data.checked) {
                    $scope.group.member.push(data.id);
                }
            });
            creategroup($scope.group);
        };

        function creategroup(team) {
            CreateGroups.create(team).then(function (data) {
                console.log(data);
                if(data.state == -1){
                    alert("创建失败！");
                }else if(data.state = 1){
                    alert("创建成功！");
                }
                $ionicHistory.goBack(-1);
            });
        }

        /**
         * 从通讯录中获取好友
         */
        $scope.getAllContacts = function () {
            var options = {};
            options.multiple = true;
            $cordovaContacts.find(options).then(function (allContacts) {
                // omitting parameter to .find() causes all contacts to be returned
                $scope.contacts = allContacts;
                alert(angular.toJson($scope.contacts[0]));
            }, function (err) {
                alert(err);
            });
        };
    });
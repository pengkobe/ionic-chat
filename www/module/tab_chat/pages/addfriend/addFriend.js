angular.module('chat.controllers')
    .controller('addFriendCtrl', function ($scope, SearchUsers, AddFriendRequest) {
        $scope.friendResults = [];
        $scope.username = '';

        /**
         * 监测搜索名称
         */
        $scope.$watch('username', function (newValue, oldValue) {
            if (newValue != "" && newValue != oldValue) {
                search(newValue);
            }
        });

        /*
        * 清空输入
        */
        $scope.searchClear = function () {
            $scope.username = '';
            $scope.friendResults = [];
        }
        function search(name) {
            SearchUsers.load(name).then(function (data) {
                var ret = [];
                for (var i = 0; i < data.length; i++) {
                    ret.push({
                        nickname: data[i].nickname,
                        _id: data[i]._id
                    });
                }
                $scope.friendResults = ret;
            });
        };

        /*
        * 发起添加好友请求
        */
        $scope.add = function (FriendID) {
            AddFriendRequest.init(FriendID,function(data){});
        };
    });
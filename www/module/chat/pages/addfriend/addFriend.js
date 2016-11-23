angular.module('chat.controllers')
    .controller('addFriendCtrl', function ($scope, SearchUsers) {
        $scope.friendResults = [];
        $scope.username = '';

        // 计时器
        var timer = new Date();
        $scope.$watch('username', function (newValue, oldValue) {
            if (newValue != oldValue) { search(newValue); }
        });

        function search(name) {
            SearchUsers.load(name).then(function (data) {
                var ret = [];
                for (var i = 0; i < data.length; i++) {
                    ret.push({
                        nickname: data[i].nickname,
                        _id:data[i]._id
                    });
                }
                $scope.friendResults = ret;
            });
        };

        $scope.add = function (FriendID) {
            var obj = {
                UserID: cache.UserID,
                FriendID: FriendID,
                FromID: cache.UserID,
                state: 0 // 发起请求
            };
        };

    });
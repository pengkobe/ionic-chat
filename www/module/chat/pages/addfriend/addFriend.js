angular.module('chat.controllers')
    .controller('addFriendCtrl', function ($scope, SEARCH_FRIENDS_URL) {
        $scope.friendResults = [];
        $scope.name = '';

        // 计时器
        var timer =  new Date();
        $scope.$watch('name', function (newValue, oldValue) {
            if (newValue === oldValue) { return; } 
            search(newValue);
        });
        
        function search(name) {

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
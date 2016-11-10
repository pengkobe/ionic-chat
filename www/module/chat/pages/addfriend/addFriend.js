angular.module('chat.controllers')
    .controller('addFriendCtrl', function ($scope, CacheFactory,HttpFactory, RequestUrl) {

        // $scope.myTel = cache.Mobile;
        $scope.myTel = "13412934921";
        $scope.friend = 0;

        $scope.search = function (tel) {
            if (!/^1\d{10}$/.test(tel)) {
              //  myNote.myNotice('电话格式不对！');
            } else {
                //     HttpFactory.send({
                //         url: RequestUrl + '',
                //         data: {
                //             Mobile: tel
                //         },
                //         method: 'post'
                //     }).success(function (data) {
                //         if (data.data.length == 0) {
                //             $scope.friend = 1;
                //         } else {
                //             $scope.friend = data.data[0];
                //         }
                //     })
            }
        };

        $scope.add = function (FriendID) {
            var obj = {
                UserID: cache.UserID,
                FriendID: FriendID,
                JoinTime: new Date(),
                FromID: cache.UserID,
                state: 0
            };

            // HttpFactory.send({
            //     url: RequestUrl + '',
            //     data: {
            //         model: angular.toJson(obj)
            //     },
            //     method: 'post'
            // }).success(function () {
            //     myNote.myNotice('好友请求已发送,等待确认！');
            //     $scope.friend = 0;
            // })
        };

    });
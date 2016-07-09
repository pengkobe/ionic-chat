/**
 * 设置首页
 */
angular.module('starter.controllers')
    .controller('PersonCtrl', function (CacheFactory, $ionicModal,  $scope,
        $rootScope, $state, $ionicPopup, signaling,  $timeout,$interval, $ionicActionSheet, initRong) { //Friends初始化加载项目人员
        var cache = angular.fromJson(CacheFactory.get('UserAccount'));
        $scope.UserName = cache.UserAccount || cache.Mobile;
        if (!!cache.RoleID) {
            $scope.RoleName = cache.RoleID <= 6 ? '主管' : (cache.RoleID == 7 ? '维修工' : '客服');
        } else {
            $scope.RoleName = '未认证';
        }
        // 获取服务端图片
        // $scope.phone = cache.headimgurl == null ? 'img/personPhoto.png' : RequestUrl + 'Images/Photo/' + cache.headimgurl;
        $scope.phone = 'img/personPhoto.png';
        var RongyuLogin = false;
        if (!$rootScope.curUID) {
            $timeout(function name(params) {
                /// ==== 协同相关(BEGIN) ====
                // 将用户id保存至全局
                var cacheUser = JSON.parse(CacheFactory.get("UserAccount"));
                var UserID = cacheUser.UserID;
                var UserName = cacheUser.UserName ? cacheUser.UserName : cacheUser.UserAccount;
                $rootScope.curUID = UserID;
                var uname = UserName ? UserName : cacheUser.Mobile;
                // 连接聊天服务[视频聊天]
                signaling.emit('login', UserID, uname, "");
                // 断线重连
                var inid = $interval(function (params) {
                    if (!RongyuLogin) {
                        var uname = UserName ? UserName : cacheUser.Mobile;
                        signaling.emit('login', UserID, uname, "");
                    }
                }, 2000);
                signaling.on('login_error', function (message) {
					if (RongyuLogin) {
						$interval.cancel(inid);
						return;
					}
					// 用户名已存在
					if (message == "用户名已存在.") {
						var alertPopup = $ionicPopup.alert({
							title: 'Error',
							template: JSON.stringify(message)
						});
						$interval.cancel(inid);
						CacheFactory.removeAll();
 						$state.go('login');
					} else {
						var alertPopup = $ionicPopup.alert({
							title: 'Error',
							template: JSON.stringify(message)
						});
					}
				});

                signaling.on('login_successful', function (user) {
                    // alert('rongyunToken' + user.rongyunToken);
                    // 初始化融云
                    if (!RongyuLogin) {
                        RongyuLogin = true;
                        $interval.cancel(inid);
                        //initRong.init(user.rongyunToken);
                    }
                });
            }, 100);
        }

        $ionicModal.fromTemplateUrl('templates/setting/about.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        $scope.about = function () {
            $scope.modal.show();
        };

        $scope.$on('$ionicView.beforeLeave', function () {
            $rootScope.$broadcast('ns:popover:Leave');
        });

    })
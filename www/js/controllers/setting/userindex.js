/**
 * 设置首页
 */

angular.module('starter.controllers')
    .controller('PersonCtrl', function (CacheFactory, $ionicModal, RequestUrl, $scope,
        $rootScope, $state, $ionicPopup, signaling, _appKey, Friends, $timeout, $ionicActionSheet) { //Friends初始化加载项目人员

        var cache = angular.fromJson(CacheFactory.get('UserAccount'));
        $scope.GoToOrderPage = function () {
            $state.go('EFOS.alarm');
        };

        $scope.UserName = cache.UserAccount || cache.Mobile;

        if (!!cache.RoleID) {
            $scope.RoleName = cache.RoleID <= 6 ? '主管' : (cache.RoleID == 7 ? '维修工' : '客服');
        } else {
            $scope.RoleName = '未认证';
        }

        $scope.phone = cache.headimgurl == null ? 'img/icon.png' : RequestUrl + 'Images/Photo/' + cache.headimgurl;

        if (!$rootScope.curUID) {
            $timeout(function name(params) {
                /// ==== 协同相关(BEGIN) ====
                // 将用户id保存至全局
                var cacheUser = JSON.parse(CacheFactory.get("UserAccount"));
                var UserID = cacheUser.UserID;
                var UserName = cacheUser.UserName ? cacheUser.UserName : cacheUser.UserAccount;
                $rootScope.curUID = UserID;
                // 连接聊天服务[视频聊天]
                signaling.emit('login', UserID, UserName, "");
                signaling.on('login_error', function (message) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: JSON.stringify(message)
                    });
                });
                signaling.on('login_successful', function (user) {
                    // alert('rongyunToken' + user.rongyunToken);
                    // 初始化融云
                    initRong(user.rongyunToken);
                });
                // 融云服务初始化(需要提取为服务)
                function initRong(token) {
                    //alert('_appKey:'+_appKey);
                    //return;
                    $rootScope.arrMsgs = new Array();
                    $rootScope.arrCons = new Array();
                    // 融云初始化
                    RongCloudLibPlugin.init({
                        appKey: _appKey
                    },
                        function (ret, err) {
                            if (ret) {
                                // alert('init:' + JSON.stringify(ret));
                            }
                            if (err) {
                                alert('init error:' + JSON.stringify(err));
                            }
                        }
                    );
                    RongCloudLibPlugin.setConnectionStatusListener(
                        function (ret, err) {
                            if (ret) {
                                // alert('setConnectionStatusListener:' + JSON.stringify(ret));
                                if (ret.result.connectionStatus == 'KICKED') {
                                    alert('您的帐号已在其他端登录!');
                                    $rootScope.hideTabs = false;
                                    $ionicHistory.clearCache();
                                    $state.go('login');
                                }
                            }
                            if (err) {
                                alert('setConnectionStatusListener error:' + JSON.stringify(err));
                            }
                        }
                    );
                    // 建立连接
                    RongCloudLibPlugin.connect({
                        token: token
                    },
                        function (ret, err) {
                            if (ret) {
                                //alert('connect:' + JSON.stringify(ret));
                                $rootScope.$apply();
                                $state.go('mainpage.messagelist', {
                                    userId: ret.result.userId
                                }, {
                                        reload: true
                                    });
                            }
                            if (err) {
                                alert('init error:' + JSON.stringify(err));
                            }
                        }
                    );
                    // 消息接收
                    RongCloudLibPlugin.setOnReceiveMessageListener(
                        function (ret, err) {
                            if (ret) {
                                // alert('setOnReceiveMessageListener:' + JSON.stringify(ret));
                                $rootScope.arrMsgs.push(JSON.stringify(ret.result.message));
                                $rootScope.$apply();
                            }
                            if (err) {
                                alert('setOnReceiveMessageListener error:' + JSON.stringify(err));
                            }
                        }
                    );
                }
                // ==== 协同相关(END) =====
            }, 100);
        }


        $ionicModal.fromTemplateUrl('html/person/about.html', {
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
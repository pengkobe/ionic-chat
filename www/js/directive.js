/**
 * 指令集
 */
angular.module('starter.directive', [])
    // 进入时隐藏tab，退出时显示(用于聊天)
    .directive('hideTabsxietong', function ($rootScope) {
        return {
            restrict: 'A',
            link: function ($scope, $el) {
                $scope.$on("$ionicView.beforeEnter", function () {
                    $rootScope.hideTabsxietong = true;
                });
                $scope.$on("$ionicView.beforeLeave", function () {
                    $rootScope.hideTabsxietong = false;
                });
            }
        };
    })
    // 弹框背景
    .directive('rjCloseBackDrop', [function () {
        return {
            scope: false,
            restrict: 'A',
            replace: false,
            link: function (scope, iElm, iAttrs, controller) {
                var htmlEl = angular.element(document.querySelector('html'));
                htmlEl.on("click", function (event) {
                    if (event.target.nodeName === "HTML" &&
                        scope.popup.optionsPopup && scope.popup.isPopup) {
                        scope.popup.optionsPopup.close();
                        scope.popup.isPopup = false;
                    }
                });
            }
        };
    }])
    // 协同相关指令
    .directive('videoView', function ($rootScope, $timeout) {
        return {
            restrict: 'E',
            template: '<div class="video-container"></div>',
            replace: true,
            link: function (scope, element, attrs) {
                function updatePosition() {
                    try {
                        cordova.plugins.phonertc.setVideoView({
                            container: element[0],
                            local: {
                                position: [240, 240],
                                size: [50, 50]
                            }
                        });
                    } catch (err) {
                        alert('direc' + err);
                    }
                }
                $timeout(updatePosition, 500);
                $rootScope.$on('videoView.updatePosition', updatePosition);
            }
        }
    })
    // 长按弹出框
    .directive('rjHoldActive', ['$ionicGesture', '$timeout', '$ionicBackdrop',
        function ($ionicGesture, $timeout, $ionicBackdrop) {
            return {
                scope: false,
                restrict: 'A',
                replace: false,
                link: function (scope, iElm, iAttrs, controller) {
                    $ionicGesture.on("hold", function () {
                        iElm.addClass('active');
                        $timeout(function () {
                            iElm.removeClass('active');
                        }, 300);
                    }, iElm);
                }
            };
        }
    ])
    // 微信分享
    .directive("clickShare", ["$ionicActionSheet", function ($ionicActionSheet) {
        return {
            scope: false,
            restrict: 'A',
            replace: false,
            link: function (scope, iElm, iAttrs) {
                var buttons = [
                    {
                        id: "check-installed",
                        label: "是否安装了微信"
                    },
                    {
                        id: "send-text",
                        label: "发送Text消息给微信"
                    },
                    {
                        id: "send-photo-local",
                        label: "发送Photo消息给微信(本地图片)"
                    },
                    {
                        id: "send-photo-remote",
                        label: "发送Photo消息给微信(远程图片)"
                    },
                    {
                        id: "send-link-thumb-local",
                        label: "发送Link消息给微信(本地缩略图)"
                    },
                    {
                        id: "send-link-thumb-remote",
                        label: "发送Link消息给微信(远程缩略图)"
                    },
                    {
                        id: "send-app",
                        label: "发送App消息给微信"
                    }
                ];
                iElm.bind("click", function (evt) {
                    var dialog = $ionicActionSheet.show({
                        buttons: [{
                            text: '<i class="ic ic-weixin"></i>微信好友'
                        },
                            {
                                text: '<i class="ic ic-weixin-moment"></i>发朋友圈'
                            }],
                        cssClass: "share-sheet",
                        cancelText: "取消",
                        cancel: function () { },
                        buttonClicked: function (e) {
                            // 0：会话，1:朋友圈，2: 收藏
                            switch (e) {
                                // 分享至微信好友
                                case 0:
                                    share(0, "send-text");
                                    break;
                                // 分享至朋友圈
                                case 1:
                                    share(1, "send-text");
                                    break;
                            }
                        }
                    });
                    evt.stopPropagation()
                });
            }
        }
    }])
    ;
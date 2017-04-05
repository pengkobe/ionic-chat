/**
 * 指令集
 */
angular.module('chat.directive', [])
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
                                position: [10, 10],
                                size: [100, 100]
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
    });

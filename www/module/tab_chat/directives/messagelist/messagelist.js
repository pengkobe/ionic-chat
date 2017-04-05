angular.module('chat.directive')
    .directive('messageList', function ($ionicPopup) {
        return {
            restrict: "E",
            templateUrl: 'dev/static/tab_chat/directives/messagelist/messagelist.tpl',
            replace: true,
            scope: {
                friendsMessage: "=friendsMessage",
                gotoChatDetils: "&gotoChatDetils2",
                markMessage: "&markMessage2",
                deleteMessage: "&deleteMessage2",
            },
            link: function (scope, element, attrs, controller) {
                scope.popup = {
                    isPopup: false,
                    index: 0
                };
                // 弹出框
                scope.popupMessageOpthins = function (message) {
                    scope.popup.index = scope.friendsMessage.indexOf(message);
                    scope.popup.optionsPopup = $ionicPopup.show({
                        templateUrl: "dev/static/tab_chat/directives/messagelist/popup.html",
                        scope: scope,
                    });
                    scope.popup.isPopup = true;
                };
                // 设为已读
                scope.markMessage_local = function () {
                    var index = scope.popup.index;
                    scope.popup.optionsPopup.close();
                    scope.popup.isPopup = false;
                    scope.markMessage()(index);
                };
                // 删除消息
                scope.deleteMessage_local = function () {
                    var index = scope.popup.index;
                    scope.popup.optionsPopup.close();
                    scope.popup.isPopup = false;
                    scope.deleteMessage()(index);
                };

                scope.gotoChatDetils_local = function (friend, $index) {
                    scope.gotoChatDetils()(friend, $index);
                }
            }
        };
    });

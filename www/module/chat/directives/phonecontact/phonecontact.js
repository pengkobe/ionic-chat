angular.module('chat.directive')
    .directive('phoneContact', function ($state, $ionicLoading,
        $ionicScrollDelegate, $timeout) {
        return {
            restrict: "E",
            templateUrl: 'module/chat/directives/phonecontact/phonecontact.tpl',
            replace: true,
            transclude : true,
            scope: {
                friendsList_local: "=friendsList",
                groupsList_local: "=groupsList",
            },
            link: function (scope, element, attrs, controller) {
                scope.initTalk = function (friendID, username, type, $event) {
                    $state.go('tab.chatDetail', {
                        messageId: '1', name: username, targetId: friendID,
                        conversationType: type
                    });
                    $event.stopPropagation();
                    $event.preventDefault();
                }
                // 联系人右边导航栏
                scope.cri = { DataValue: '' };
            }
        };
    });

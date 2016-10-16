angular.module('chat.directive')
    .directive('chatInput', [function(PhotoAndImages, $timeout) {
        return {
            restrict: "E",
            templateUrl: 'module/chat/js/directives/chatinput/chatinput.tpl',
            replace: true,
            scope: {
                onShowFace: "=onShowFace",
                onShowPhonebar: "=onShowPhonebar",
                onSendTextMessage: "&onSendTextMessage",
                onVoiceHold: "&onVoiceHold",
                onVoiceRelease: "&onVoiceRelease",

                // isVoiceMethod: "=isVoiceMethod",
                //send_content: "=send_content",
                // isStartRecord: "=isStartRecord",
                // showPhonebar: "=showPhonebar",
            },
            link: function(scope, element, attrs, controller) {
                scope.isVoiceMethod = true;
                scope.isStartRecord = 0,
                    scope.send_content = '';

                scope.switchInputMethod = function(evtobj) {
                    if (scope.isVoiceMethod = !scope.isVoiceMethod, scope.isVoiceMethod) {
                        var i = 1;
                    } else {
                        var input = evtobj.currentTarget.parentNode.querySelector("textarea");
                        scope.isStartRecord = !1;
                        $timeout(function() {
                            // input.focus()
                        }, 500);
                    }
                }

                scope.onSendMessage = function() {
                    scope.onSendTextMessage()();
                }
                scope.onVoiceHold = function() {}
                scope.onVoiceRelease = function() {

                }

            }
        };
    }]);

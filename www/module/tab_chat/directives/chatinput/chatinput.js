angular.module('chat.directive')
    .directive('chatInput', function (PhotoAndImages, $timeout) {
        return {
            restrict: "E",
            templateUrl: 'dist/dev/static/tab_chat/directives/chatinput/chatinput.tpl',
            replace: true,
            scope: {
                sendmessage: "=textMessage",
                onShowFace: "=onShowFace",
                onShowPhonebar: "=onShowPhonebar",
                onSendTextMessage: "&onSendTextMessage",
                onVoiceHold: "&onVoiceHold",
                onVoiceRelease: "&onVoiceRelease",
            },
            link: function (scope, element, attrs, controller) {
                scope.isVoiceMethod = true;
                scope.isStartRecord = 0,

                scope.switchInputMethod = function (evtobj) {
                    if (scope.isVoiceMethod = !scope.isVoiceMethod, scope.isVoiceMethod) {
                        var i = 1;
                    } else {
                        var input = evtobj.currentTarget.parentNode.querySelector("textarea");
                        scope.isStartRecord = !1;
                        $timeout(function () {
                            // input.focus()
                        }, 500);
                    }
                }

                scope.onSendMessage = function () {
                    scope.onSendTextMessage()();
                    //scope.sendmessage = '';
                    $timeout(function () {
                        document.querySelector("#text_content").focus();
                    }, 0);
                }
                scope.onVoiceHold = function () { }
                scope.onVoiceRelease = function () { }

            }
        };
    });

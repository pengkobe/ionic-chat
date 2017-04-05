angular.module('chat.directive')
    .directive('chatMessagePanel', function ($ionicModal, $timeout) {
        return {
            restrict: "E",
            templateUrl: 'dev/static/tab_chat/directives/chatmessagepanel/chatmessagepanel.tpl',
            replace: true,
            scope: {
                messageList: "=messageList",
            },
            link: function (scope, element, attrs, controller) {
                var mediaRec;
                scope.play = function (voiFile, type) {
                    if (mediaRec) {
                        mediaRec.stop();
                        mediaRec.release();
                    }
                    var target = angular.element(event.target).find("i");
                    if (type == "you") {
                        target.addClass("web_wechat_voice_gray_playing");
                    } else {
                        target.addClass("web_wechat_voice_playing");
                    }
                    if (isIOS) {
                        voiFile = voiFile.replace('file://', '');
                    }
                    mediaRec = new Media(voiFile,
                        // 成功操作
                        function () {
                            if (type == "you") {
                                target.removeClass("web_wechat_voice_gray_playing");
                            } else {
                                target.removeClass("web_wechat_voice_playing");
                            }
                            console.log("play():Audio Success");
                        },
                        // 失败操作
                        function (err) {
                            if (type == "you") {
                                target.removeClass("web_wechat_voice_gray_playing");
                            } else {
                                target.removeClass("web_wechat_voice_playing");
                            }
                            console.log("play():Audio Error: " + err.code);
                        }
                    );
                    //开始播放录音
                    mediaRec.play();
                    return false;
                };

                $ionicModal.fromTemplateUrl('dev/static/tab_chat/directives/chatmessagepanel/message/BigImage.html', {
                    scope: scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    scope.modal = modal;
                });
                scope.openImage = function (data) {
                    scope.imageData = data;
                    scope.modal.show();
                };
                scope.closeModal = function () {
                    scope.modal.hide();
                };
                scope.openImage = function (data) {
                    scope.imageData = data;
                    scope.modal.show();
                };
                // 构建消息UI模板
                scope.buildUrl = function (type) {
                    var tmpName;
                    switch (type) {
                        case 'RC:TxtMsg':
                            tmpName = 'txt';
                            break;
                        case 'RC:ImgMsg':
                            tmpName = 'img';
                            break;
                        case 'RC:DizNtf':
                            tmpName = 'diz';
                            break;
                        case 'RC:LBSMsg':
                            tmpName = 'lbs';
                            break;
                        case 'RC:ImgTextMsg':
                            tmpName = 'imgtext';
                            break;
                        case 'RC:VcMsg':
                            tmpName = 'vc';
                            break;
                        default:

                    }
                    return 'dev/static/tab_chat/directives/chatmessagepanel/message/' + tmpName + '.html';
                }
            }
        };
    });

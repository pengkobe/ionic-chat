angular.module('chat.directive')
    .directive('qqFace', function () {
        return {
            restrict: "E",
            templateUrl: 'dev/static/tab_chat/directives/qqface/qqface.tpl',
            replace: true,
            scope: {
                selectQqFace: "&selectQqFace"
            },
            link: function (scope, element, attrs, controller) {
                // 表情选择事件
                scope.chooseFace = function (evt) {
                    if (evt.srcElement.title) {
                        var text_content = document.querySelector("#text_content");
                        scope.selectQqFace()("[" + event.srcElement.title + "]");
                    }
                }
                // just for unit test
                scope.justTest = function () {
                    return true;
                }
            }
        };
    });

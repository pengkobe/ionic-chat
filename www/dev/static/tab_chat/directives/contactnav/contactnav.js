/**
 * 指令集
 */
angular.module('chat.directive')
    .directive("ngTouchend", function() {
        return {
            controller: function($scope, $element, $attrs) {
                $element.bind('touchend', onTouchEnd);

                function onTouchEnd(event) {
                    var method = $element.attr('ng-touchend');
                    $scope.$event = event;
                    $scope.$apply(method);
                };
            }
        };
    }).directive("ngTouchmove", function() {
        return {
            controller: function($scope, $element, $attrs) {
                $element.bind('touchstart', onTouchStart);

                function onTouchStart(event) {
                    event.preventDefault();
                    $element.bind('touchmove', onTouchMove);
                    $element.bind('touchend', onTouchEnd);
                };

                function onTouchMove(event) {
                    var method = $element.attr('ng-touchmove');
                    $scope.$event = event;
                    $scope.$apply(method);
                };

                function onTouchEnd(event) {
                    event.preventDefault();
                    $element.unbind('touchmove', onTouchMove);
                    $element.unbind('touchend', onTouchEnd);
                };
            }
        };
    }).directive('contactNav', [function() {
        return {
            restrict: "E",
            template: '<div class="nav-container">'
            + '    <ul class="alpha-nav" '
            + '        ng-touchmove="goList($event)" '
            + '        ng-touchend="hidePromptBox()" '
            + '        ng-touchstart="goListByTap($event)">'
            + '        <li ng-repeat="charobj in navCharList_local" '
            + '              data-id="{{charobj.id}}">{{charobj.firstChar}} '
            + '        </li> '
            + '        <div class="prompt-box" ng-show="tipObj.isShow">{{tipObj.content}}</div> '
            + '    </ul> '
            + '</div>',
            replace: true,
            scope: {
                navCharList_local: "=navCharList",
                charClickCb: "&charClickCb"
            },
            link: function(scope, element, attrs, controller) {
                // 滚动的指定元素
                var _delegateHandle = attrs["delegateHandleName"];
                scope.tipObj = {
                    "isShow": false,
                    "content":''
                };

                /*
                 * 隐藏提示框
                 * @param {object} event [release事件对象]
                 * */
                scope.hidePromptBox = function(event) {
                    scope.tipObj = { "isShow": false };
                };

                /*
                 * 用户单击
                 * @param {object} event [release事件对象]
                 * */
                scope.goListByTap = function(event) {
                    var nodeName = event.target.nodeName.toUpperCase();
                    if (nodeName !== "LI") {
                        return;
                    }
                    // 事件源
                    var target = angular.element(event.target);
                    // 首字母
                    var firstCode = target.html();
                    // 导航事件回调
                    var aaaa = scope.charClickCb()(firstCode);

                    //标签id
                    var id = target.attr("data-id");
                    scope.tipObj = { "isShow": true, "content": firstCode };

                    scrollCharToTop(id, _delegateHandle);
                };

                /*
                 * 用户滑动
                 * @param {object} event [release事件对象]
                 * */
                scope.goList = function(event) {
                    var nodeName = event.target.nodeName.toUpperCase();
                    if (nodeName !== "LI") {
                        return;
                    }
                    // 根据坐标来获取元素！
                    var ttt = document.elementFromPoint(
                        event.changedTouches[0].pageX,
                        event.changedTouches[0].pageY
                    );
                    nodeName = ttt ? ttt.nodeName.toUpperCase() : "";
                    if (nodeName !== "LI") {
                        return;
                    }
                    var target = angular.element(ttt);
                    var firstCode = target.html().trim();
                    // 导航事件回调
                    scope.charClickCb()(firstCode);
                    // 导航id
                    var id = target.attr("data-id");
                    // 提示框
                    scope.tipObj = { "isShow": true, "content": firstCode };
                    scrollCharToTop(id, _delegateHandle);
                };

                /*
                 * 通讯录滚动逻辑
                 * @param {object} id [首字母元素ID]
                 * @param {object} _delegateHandle [容器对象]
                 * */
                function scrollCharToTop(id, _delegateHandle) {
                    var charPos = angular.element(document.querySelectorAll("#_" + id));
                    var contactContainer = angular.element(document.querySelectorAll("#" + _delegateHandle));
                    if (charPos.length === 1) {
                        scrollTop = charPos[0].offsetTop;
                        // 27为元素高度
                        contactContainer[0].scrollTop = scrollTop - 27;
                    } else {
                        throw ("nav not exits or more than one");
                    }
                }
            }
        };
    }]);

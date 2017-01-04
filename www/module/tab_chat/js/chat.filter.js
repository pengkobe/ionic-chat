/// 字符转码
; angular.module('chat.filter', [])
    .filter('trustHtml', function ($sce) {
        return function (input) {
            return $sce.trustAsHtml(input);
        }
    });

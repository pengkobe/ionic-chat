angular.module('chat.directive')
    .directive('chatToolBar', function(PhotoAndImages) {
        return {
            restrict: "E",
            templateUrl: 'module/chat/directives/chattoolbar/chattoolbar.tpl',
            replace: true,
            scope: {
                sendPhoto: "&sendPhoto",
                conversationType:"=conversationType"
            },
            link: function(scope, element, attrs, controller) {
                scope.takePic = function(way) {
                    var options;
                    // 从相册中选择
                    if (way) {
                        options = {
                            quality: 80,
                            targetWidth: 320,
                            targetHeight: 320,
                            saveToPhotoAlbum: false,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                            destinationType: Camera.DestinationType.FILE_URI
                        };
                        PhotoAndImages.getImages(options).then(function(data) {
                            scope.sendPhoto()(data);
                        });
                    } else {
                        // 拍照获取
                        options = {
                            quality: 80,
                            targetWidth: 320,
                            targetHeight: 320,
                            saveToPhotoAlbum: false,
                            sourceType: Camera.PictureSourceType.Camera,
                            destinationType: Camera.DestinationType.FILE_URI
                        };
                        PhotoAndImages.getPhoto(options).then(function(data) {
                            scope.sendPhoto()(data);
                        });
                    }
                }
            }
        };
    });

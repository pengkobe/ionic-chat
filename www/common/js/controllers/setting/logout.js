angular.module('starter.controllers')
    .controller('SettingCtrl', function ($scope, CacheFactory) {
        $scope.exit = function () {
            CacheFactory.removeAll();
            ionic.Platform.exitApp();
        };
    })
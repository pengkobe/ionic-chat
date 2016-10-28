/**
 * dash.service
 * 权限管理，模块加载与初始化
 */

angular.module('dash.service', [])
    // 好友服务
    .factory('AddNewUserService', function (HttpPromiseService, REGISTER_URL) {
        return {
            init: function () {
                debugger;
                var params = {
                    usename: 'pengyi',
                    password: '123'
                };
                HttpPromiseService.getData(REGISTER_URL, params).then(function (data) {
                    console.log(data);
                    debugger;
                });
            }
        };
    })
    .factory('AddNewGroupService', function (HttpPromiseService) {
        return {};
    })
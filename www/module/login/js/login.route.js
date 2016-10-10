/**
 * Created by superman on 2016/6/14.
 * 登录模块路由
 *
 */
'use strict';
angular.module('com.tm.app.login.route', [])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider

    /**
     * 登录模块路由
     */
      .state('login', {
        url: '/login',
        templateUrl: 'module/login/login.html',
        controller: 'LoginController',
        data: {isPublic: true}
      })
      .state('footer.login', {
        views: {
          'product': {
            templateUrl: 'module/login/login.html',
            controller: 'LoginController'
          }
        },
        data: {isPublic: true}
      })
      .state('footer.register', {
        url: '/register',
        views: {
          'product': {
            templateUrl: 'module/login/register.html',
            controller: 'RegisterController',
          }
        },
        data: {isPublic: true}
      })
      .state('footer.reset-password', {
        url: '/reset-password',
        views: {
          'product': {
            templateUrl: 'module/login/reset-password.html',
            controller: 'ResetPasswordController'
          }
        },
        data: {isPublic: true}
      })
  }])
;

/**
 * 10-29
 */
'use strict';
angular.module('login.route', [])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'module/login/tpl/login.html',
        controller: 'LoginController',
      })
      .state('register', {
        url: '/register',
        templateUrl: 'module/login/tpl/register.html',
        controller: 'RegisterController',
      })
  }])
  ;

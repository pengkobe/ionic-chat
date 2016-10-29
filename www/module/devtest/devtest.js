/**
 * 测试
*/
angular.module('devtest', ['devtest.service'])
  .controller('DevTestCtrl', function ($scope, Mocking_Users, Mocking_Friends, loadAllFriend) {
    $scope.mockingUsers = function () {
      alert('模拟用户数据');
      Mocking_Users.init();
      console.log("模拟用户数据...");
    };
    $scope.mockingFriends = function () {
      alert('模拟添加用户好友数据');
      Mocking_Friends.init();
      console.log("模拟添加用户好友数据...");
    };
    $scope.testLoadAllFriends = function () {
      alert('测试Loadfriends');
      loadAllFriend.init();
      console.log("测试Loadfriends...");
    };
  })




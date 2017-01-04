/**
 * 测试
*/
angular.module('devtest', ['devtest.service'])
  .controller('DevTestCtrl', function ($scope,
    // 好友
    Mocking_Users, Mocking_Friends, loadAllFriend, test_LoadAllGroups,
    // 群
    Mocking_Groups, mocking_load_Groupmember,
    // 好友请求
    mocking_add_FriendRequest, mocking_res_FriendRequest_agree, mocking_res_FriendRequest_reject, mocking_loadAll_FriendRequest,
    // 群请求
    mocking_add_GroupRequest, mocking_res_GroupRequest_agree, mocking_res_GroupRequest_reject,mocking_load_GroupRequest

  ) {
    // ======好友
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
    $scope.testLoadAllGroups = function () {
      alert('模拟加载用户的所有群');
      test_LoadAllGroups.init();
      console.log("模拟加载用户的所有群...");
    };

    // ======群组
    $scope.mockingGroups = function () {
      alert('模拟群组数据');
      Mocking_Groups.init();
      console.log("模拟群组数据...");
    };
    $scope.mockingloadGroupmember = function () {
      alert('模拟用户加群');
      mocking_load_Groupmember.init();
      console.log("模拟用户加群...");
    };



    // ======好友请求相关
    $scope.mocking_addFriendRequest = function () {
      alert('模拟添加对方为好友');
      mocking_add_FriendRequest.init();
      console.log("模拟添加对方为好友...");
    };

    $scope.mockingLoadAllFriendRequest = function () {
      alert('模拟加载所有好友请求');
      mocking_loadAll_FriendRequest.init();
      console.log("模拟加载所有好友请求...");
    };

    $scope.mocking_resFriendRequest_agree = function () {
      alert('模拟同意添加对方为好友');
      mocking_res_FriendRequest_agree.init();
      console.log("模拟同意添加对方为好友...");
    };
    $scope.mocking_resFriendRequest_reject = function () {
      alert('模拟拒绝添加对方为好友');
      mocking_res_FriendRequest_reject.init();
      console.log("模拟拒绝添加对方为好友...");
    };


    // ======群组请求相关 
    $scope.mocking_addGroupRequest = function () {
      alert('模拟添加好友进群');
      mocking_add_GroupRequest.init();
      console.log("模拟添加好友进群...");
    };
    $scope.mockingLoadAllGroupRequest = function () {
      alert('模拟加载所有进群请求');
      mocking_load_GroupRequest.init();
      console.log("模拟加载所有进群请求...");
    };
    $scope.mocking_resGroupRequest_agree = function () {
      alert('模拟同意进群');
      mocking_res_GroupRequest_agree.init();
      console.log("模拟同意进群...");
    };
    $scope.mocking_resGroupRequest_reject = function () {
      alert('模拟拒绝进群');
      mocking_res_GroupRequest_reject.init();
      console.log("模拟拒绝进群...");
    };

  })




angular.module('devtest.service', [])

    .factory('Mocking_Friends', function (HttpPromiseService, LOAD_ALL_USER_URL, ADD_FRIEND_URL) { // 成功
        // 模拟数据插入好友列表
        return {
            init: function () {
                HttpPromiseService.getData(LOAD_ALL_USER_URL, {}).then(function (data) {
                    var _ids = '';
                    // 拼凑ID字符串，以";"分隔
                    for (var i = 0; i < data.length; i++) {
                        _ids += data[i]._id;
                        _ids += ";"
                    }
                    // 给username为py的用户添加所有好友
                    var params = {
                        username: 'py',
                        _ids: _ids,
                    };
                    HttpPromiseService.getData(ADD_FRIEND_URL, params).then(function (data) {
                        console.log(data);
                    });
                    console.log(data);
                });
            }
        }
    })

    .factory('loadAllFriend', function (HttpPromiseService, LOAD_FRIENDS_URL) { // 成功
        // 测试加载好友数据接口
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(LOAD_FRIENDS_URL, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })








    .factory('mocking_add_Groups', function (HttpPromiseService, LOAD_GROUPS_URL, ADD_GROUP_URL) {
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(ADD_GROUP_URL, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })
    .factory('test_LoadAllGroups', function (HttpPromiseService, LOAD_GROUPS_URL) {
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(LOAD_GROUPS_URL, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })




    // ==========好友请求相关
    .factory('mocking_add_FriendRequest', function (HttpPromiseService, REQ_FRIEND_URL) { // 成功
        return {
            init: function () {
                // #/tab/friendInfo/5819b57430ac0f042104b78b/戴露/PRIVATE
                var params = {
                    username: 'zhouw',
                    friendid: '5819b57430ac0f042104b78b' // dl
                };
                HttpPromiseService.getData(REQ_FRIEND_URL, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })
    .factory('mocking_loadAll_FriendRequest', function (HttpPromiseService, LOAD_FRIEND_REQUEST_URL) { // 成功
        return {
            init: function () {
                // #/tab/friendInfo/5819b57430ac0f042104b78b/戴露/PRIVATE
                var params = {
                    username: 'dl',
                };
                HttpPromiseService.getData(LOAD_FRIEND_REQUEST_URL, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })
    .factory('mocking_res_FriendRequest_agree', function (HttpPromiseService, RES_FRIEND_REQUEST) {
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(RES_FRIEND_REQUEST, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })
    .factory('mocking_res_FriendRequest_reject', function (HttpPromiseService, RES_FRIEND_REQUEST) {
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(RES_FRIEND_REQUEST, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })





    // ============群组请求相关
    .factory('mocking_add_GroupRequest', function (HttpPromiseService, REQ_GROUP_MEMBER_URL) {
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(REQ_GROUP_MEMBER_URL, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })
    .factory('mocking_res_GroupRequest_agree', function (HttpPromiseService, RES_GROUP_REQUEST) {
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(RES_GROUP_REQUEST, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })
    .factory('mocking_res_GroupRequest_reject', function (HttpPromiseService, RES_GROUP_REQUEST) {
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(RES_GROUP_REQUEST, params).then(function (data) {
                    debugger;
                    console.log(data);
                });
            }
        }
    })

angular.module('devtest.service', [])


// ========== 好友
    .factory('Mocking_Users', function (HttpPromiseService, REGISTER_URL) { // 成功
        return {
            init: function () {
                // 模拟数据插入数据库
                var data = [
                    { _id: 17, username: 'ydkf', nickname: "ydkf", headimg: null },
                    { _id: 18, username: 'ydgczg', nickname: "ydgczg", headimg: null },
                    { _id: 384, username: 'py', nickname: "py", headimg: "15602452846-201609051736.png" },
                    { _id: 386, username: 'lxq', nickname: "lxq", headimg: null },
                    { _id: 388, username: 'yxy', nickname: "yxy", headimg: "13760425110-201609191259.png" },
                    { _id: 412, username: 'heyc', nickname: "heyc", headimg: "15602452846-201609051736.png" },
                    { _id: 414, username: 'wanhuali', nickname: "万华利", headimg: null },
                    { _id: 415, username: 'lijm', nickname: "wanhuali", headimg: "lijm-201609220947.png" },
                    { _id: 417, username: 'xiaorj', nickname: "xiaorj", headimg: null },
                    { _id: 419, username: 'liws', nickname: "liws", headimg: null },
                    { _id: 420, username: 'chengh', nickname: "chengh", headimg: null },
                    { _id: 421, username: 'yeyj', nickname: "yeyj", headimg: null },
                    { _id: 422, username: 'guozc', nickname: "guozc", headimg: null },
                    { _id: 423, username: 'lib', nickname: "lib", headimg: null },
                    { _id: 424, username: 'zhouw', nickname: "zhouw", headimg: "zhouw-201609202117.png" },
                    { _id: 425, username: 'tiankq', nickname: "tiankq", headimg: null },
                    { _id: 426, username: 'daibl', nickname: "daibl", headimg: null },
                    { _id: 427, username: 'haungjy', nickname: "haungjy", headimg: null },
                    { _id: 428, username: 'gaomx', nickname: "gaomx", headimg: null },
                    { _id: 431, username: 'zhongsy', nickname: "zhongsy", headimg: null },
                    { _id: 432, username: 'zhul', nickname: "zhul", headimg: null },
                    { _id: 433, username: 'dl', nickname: "dl", headimg: "dl-201609191259.png" },
                    { _id: 434, username: 'hj', nickname: "hj", headimg: "hj-201609202146.png" },
                    { _id: 435, username: 'zf', nickname: "zf", headimg: "zf-201609202116.png" },
                    { _id: 437, username: 'sxh', nickname: "sxh", headimg: "sxh-201609191313.png" },
                    { _id: 441, username: 'ld', nickname: "ld", headimg: "ld-201609201557.png" },
                    { _id: 442, username: 'lp', nickname: "lp", headimg: "lp-201609200945.png" }
                ];
                for (var i = 0; i < data.length; i++) {
                    var params = {
                        username: data[i].username,
                        nickname: data[i].nickname,
                        headimg: data[i].headimg,
                        password: '123'
                    };
                    HttpPromiseService.getData(REGISTER_URL, params).then(function (data) {
                        console.log(data);
                    });
                }
            }
        };
    })
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






    // ==========群组
    .factory('Mocking_Groups', function (HttpPromiseService, CREATE_GROUP_URL) {
        return {
            init: function () {
                var params = {
                    username: 'py',
                };
                HttpPromiseService.getData(CREATE_GROUP_URL, params).then(function (data) {
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
                HttpPromiseService.getData(ADD_USER_GROUP_URL, params).then(function (data) {
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
                    friendid:'5819b57430ac0f042104b78b' // dl
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

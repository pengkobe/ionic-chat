/**
 * 全局常量
 * http://115.29.51.196:5000
 */
angular.module('ionchat.config', [])
    // 请求基地址
    .constant('RequestUrl', 'http://120.24.54.92:9102/')
    // 融云appkey
    .constant('RONGYUN_APPKEY', 'lmxuhwagxgt9d')
    // 基地址
    .constant('BASE_URL', 'http://localhost:54321/')
    // 视频聊天基地址
    .constant('VEDIO_CHAT_URL', 'http://localhost:54321/vediochat')
    // 热更新地址
    .constant('HOT_UPDATE_URL', 'http://115.29.51.196:4321/www/')


    // =========好友相关=============
    // 登录
    .constant('LOGIN_URL', 'http://localhost:54321/login')
    // 注册
    .constant('REGISTER_URL', 'http://localhost:54321/register')
    // 加载好友列表
    .constant('LOAD_FRIENDS_URL', 'http://localhost:54321/loadfriends')
    // 加载群组列表
    .constant('LOAD_GROUPS_URL', 'http://localhost:54321/loadgroups')
    // 请求添加好友
    .constant('REQ_FRIEND_URL', 'http://localhost:54321/req_addfriend')
    // 回复好友请求
    .constant('RES_FRIEND_REQUEST', 'http://localhost:54321/res_addfriend')
    // 删除好友
    .constant('REMOVE_FRIEND_URL', 'http://localhost:54321/removefriend')
    // 加载添加好友请求
    .constant('LOAD_FRIEND_REQUEST_URL', 'http://localhost:54321/loadfriendrequest')


    // =========群相关=============
    // 创建群
    .constant('CREATE_GROUP_URL', 'http://localhost:54321/creategroup')
    // 加载成员列表
    .constant('LOAD_GROUPMEMBERS', 'http://localhost:54321/loadgroupmembers')
    // 请求添进群加群
    .constant('REQ_GROUP_MEMBER_URL', 'http://localhost:54321/req_addgroupmember')
    // 回复加群
    .constant('RES_GROUP_REQUEST', 'http://localhost:54321/res_addgroupmember')
    // 退群
    .constant('REMOVE_GROUP_URL', 'http://localhost:54321/removegroup')
    // 加载入群好友请求
    .constant('LOAD_GROUP_REQUEST_URL', 'http://localhost:54321/loadgrouprequesst')


    // =========测试用=============


    // 直接添加好友
    .constant('ADD_FRIEND_URL', 'http://localhost:54321/addfriend')
    .constant('LOAD_ALL_USER_URL', 'http://localhost:54321/loadallusers');
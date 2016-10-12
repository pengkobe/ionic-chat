/*-----
融云工作组关系映射表
------*/

var mongoose = require('./db-moogoose');
// 融云
var rongcloudSDK = require('rongcloud-sdk');
rongcloudSDK.init('lmxuhwagxgt9d', 'NpbRLWPxB79');

var Schema = mongoose.Schema;

var GroupsSchema = new Schema({
    // 用户编号
    groupid: { type: String, unique: true },
    // 用户名,使用电话登录时这个用不着
    groupname: { type: String },
    // 群成员[这里可以不要]
    userids: { type: Array, default: [] },
    // 是否激活
    // enum:[0,1]
    isActivated: { type: Number, default: 0 }

    // 加群 from to time
});

// 获取或同步群
GroupsSchema.statics.findGroup = function (groupid, groupname, userids, headImg, cb) {
    var that = this;
    console.log('groupid11:' + groupid);
    // 第一步，查询 , groupname: groupname
    that.find({ groupid: groupid }, function (err, group) {
        console.log('groupid:' + group.length);
      
        var needUpdate = false;
        if (group && group.length > 0) {
            var tempgroup = group[0];
            console.log('tempgroup:' + tempgroup.userids);
            for (var i = 0; i < tempgroup.userids.length; i++) {
                for (var j = 0; j < userids.length; j++) {
                    if (tempgroup.userids[i] != userids[j]) {
                        needUpdate = true;
                    }
                }
            }
        }

        if (!group || group.length == 0 || needUpdate) {
            // 第二步，创建群组
            var chatgroup = new chatGroupsModel({
                groupid: groupid,
                groupname: groupname,
                headimg: '',
                userids: userids,
                isActivated: 1
            });

            rongcloudSDK.group.create(userids, groupid, groupname, 'json', function (err, data) {
                if (err) {
                    cb(err, null);
                    console.log('err:'+err);
                } else {
                    console.log('succeed:'+data + 'needUpdate:'+ needUpdate);
                    var data = JSON.parse(data);
                    if (data.code == 200) {
                        // 更新
                        if (needUpdate) {
                            that.where({ _id: group._id }).update({ $set: { userids: userids } });
                        } else {// 添加
                            chatgroup.save(function (err, doc) {
                                if (doc && doc.length > 0) {
                                    cb(null, doc[0]);
                                }
                            });
                        }
                    } else {
                        cb(data.code, null);
                    }
                }
            });
        } else {
            cb(null, group[0]);
        }
    });
}

var chatGroupsModel = mongoose.model('Groups', GroupsSchema);

module.exports = chatGroupsModel;

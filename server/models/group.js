/*-----
群
------*/
var mongoose = require('../db-moogoose');
// 融云
var rongcloudSDK = require('rongcloud-sdk');
rongcloudSDK.init('lmxuhwagxgt9d', 'NpbRLWPxB79');

var Schema = mongoose.Schema;
var GroupSchema = new Schema({
    // 群名
    groupname: { type: String, default: '' },
    // 群成员
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // 群头像
    groupimg: { type: String, default: '' },
});


/**
 * 查找所有好友
 */
GroupSchema.methods.loadMembers = function (groupid, groupname, cb) {
    if (groupid) {
        GroupsModel.findOne({ groupid: this.groupid })
            .populate('members')
            .exec(cb);
    } else if (groupname) {
        GroupsModel.findOne({ groupname: this.groupname })
            .populate('members')
            .exec(cb);
    }
}

/**
 * member id类型转换
 */
GroupSchema.path('members').set(function (members) {
    var ret = [];
    for (var i = 0; i < members.length; i++) {
        ret.push(mongoose.Types.ObjectId(members[i]));
    }
    return ret;
});

/**
 * 获取或同步群至融云
 */
GroupSchema.statics.findGroup = function (groupid, groupname, members, headImg, cb) {
    var that = this;
    that.find({ groupid: groupid }, function (err, group) {
        var needUpdate = false;
        if (group && group.length > 0) {
            var tempgroup = group[0];
            for (var i = 0; i < tempgroup.members.length; i++) {
                for (var j = 0; j < members.length; j++) {
                    if (tempgroup.members[i] != members[j]) {
                        needUpdate = true;
                    }
                }
            }
        }

        if (!group || group.length == 0 || needUpdate) {
            var chatgroup = new GroupsModel({
                groupid: groupid,
                groupname: groupname,
                groupimg: '',
                members: members,
            });
            // 同步群信息(群名)
            rongcloudSDK.group.create(members, groupid, groupname, 'json', function (err, data) {
                if (err) {
                    cb(err, null);
                } else {
                    var data = JSON.parse(data);
                    if (data.code == 200) {
                        if (needUpdate) {
                            that.where({ _id: group._id }).update({ $set: { members: members } });
                        } else {
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

var GroupsModel = mongoose.model('Group', GroupSchema);
module.exports = GroupsModel;
/*-----
群
------*/
var mongoose = require("../db-moogoose");
// 融云
var rongcloudSDK = require("rongcloud-sdk");
rongcloudSDK.init("lmxuhwagxgt9d", "NpbRLWPxB79");

var Schema = mongoose.Schema;
var GroupSchema = new Schema({
  // 群名
  groupname: { type: String, default: "" },
  // 群成员
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  // 群头像
  groupimg: { type: String, default: "" }
});

/**
 * 查找所有好友
 */
GroupSchema.methods.loadMembers = function(groupid, groupname, cb) {
  if (groupid) {
    GroupsModel.findOne({ groupid: this.groupid }).populate("members").exec(cb);
  } else if (groupname) {
    GroupsModel.findOne({ groupname: this.groupname })
      .populate("members")
      .exec(cb);
  }
};

/**
 * member id类型转换
 */
GroupSchema.path("members").set(function(members) {
  var ret = [];
  console.log("members path:", members);
  for (var i = 0; i < members.length; i++) {
    ret.push(mongoose.Types.ObjectId(members[i]));
  }
  return ret;
});

/**
 * 获取或同步群至融云
 */
GroupSchema.statics.findGroup = function(
  groupid,
  groupname,
  members,
  headImg,
  cb
) {
  var that = this;
  that.find({ groupid: groupid }, function(err, group) {
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
        groupimg: "",
        members: members
      });
      // 同步群信息(群名)
      rongcloudSDK.group.create(members, groupid, groupname, "json", function(
        err,
        data
      ) {
        if (err) {
          cb(err, null);
        } else {
          var data = JSON.parse(data);
          if (data.code == 200) {
            if (needUpdate) {
              that
                .where({ _id: group._id })
                .update({ $set: { members: members } });
            } else {
              chatgroup.save(function(err, doc) {
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
};

/**
 * 添加群成员
 * @param {Object} groupid  编号
 * @param {Array}  _ids     需要添加的成员数据
 * @param {Function} cb     回调函数
 */
GroupSchema.statics.addMember = function(groupid, _ids, cb) {
  var that = this;
  var mongoose_ids = [];
  // 类型转换
  for (var i = 0; i < _ids.length; i++) {
    if (_ids[i] && _ids[i] != "") {
      mongoose_ids.push(mongoose.Types.ObjectId(_ids[i]));
    }
  }

  var query = { _id: mongoose.Types.ObjectId(groupid) };
  console.log("addMembers _ids:", _ids);
  that.findOne(query).exec(function(err, doc) {
    console.log("addMembers doc:", doc);
    if (err) {
      console.log("addMembers err:", err);
      cb(err);
      return;
    }
    if (doc && doc._id) {
      var members = [];
      // 原有成员
      if (doc.members) {
        members = members.concat(doc.members);
      }
      // 新成员
      members = members.concat(mongoose_ids);
      console.log("members:", members);
      that.update(
        { _id: groupid }, // condition
        { members: members }, // doc
        { multi: true }, // option
        cb // callback
      );
    } else {
      console.log("addmembers  0 ret:", doc);
    }
  });
};

var GroupsModel = mongoose.model("Group", GroupSchema);
module.exports = GroupsModel;

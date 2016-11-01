var express = require('express');
var router = express.Router();
var https = require('https');
var settings = require('../settings');

var UserModel = require('../models/user.js');
var GroupModel = require('../models/group.js');

// 生成身份二维码
var qr = require('qr-image');
var fs = require("fs");
var ObjectID = require('mongodb').ObjectID;
function file(name) {
  return fs.createWriteStream('../public/img/' + name);
}

// 注册
router.post('/register', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var nickname = req.body.nickname;
  var headimg = req.body.headimg ? req.body.headimg : '';
  var UserEntity = new UserModel({ username: username, password: password, nickname: nickname, headimg: headimg });
  UserEntity.save(function (err, doc) {
    console.log(doc)
    // 生成二维码名片,默认为png
    // var ustr = JSON.stringify(doc);
    // qr.image(ustr, { type: 'png', ec_level: 'Q', parse_url: false, margin: 1 })
    //   .pipe(file(doc._id + '.png'));
    if (err) {
      res.json({ state: -1, message: err });
    } else {
      res.json({ state: 1, user: doc });
    }
  });
});

// 登录
router.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  console.log('login username:', this.username);
  console.log('login password:', this.password);

  var UserEntity = new UserModel({ username: username, password: password });
  UserEntity.login(function (err, users) {
    if (err) {
      res.json({ state: -1, message: err });
    }
    console.log('login users:', users);
    if (users.length == 0) {
      res.json({ state: -1, message: "账户或密码错误！" });
    } else {
      res.json(users[0]);
    }
  });
});

// 用户头像上传
router.post('/user/headimg', function (req, res) {
  var userid = req.body.userid;
  var imgData = req.body.imgData;
  // 过滤data:URL,已经在前端过滤
  // var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
  var dataBuffer = new Buffer(imgData, 'base64');
  // 头像存储路径[相对路径]
  var imgPath = '../public/headimg/' + userid + '.png';
  fs.writeFile(imgPath, dataBuffer, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.send("保存成功！");
    }
  });
});


// 更新密码
router.post('/update', function (req, res) {
  var username = req.body.username;
  var oldpassword = req.body.oldpassword;
  var newpassword = req.body.newpassword;
  // 删除所有好友了:(,new表示返回更新后的值
  UserModel.findOneAndUpdate(
    { username: username, password: oldpassword },
    { $set: { password: newpassword } },
    { new: true },
    function (err, raw) {
      if (err) {
        // todo
      }
      console.log('ret:', raw);
    });
});


// 拉取好友列表
router.post('/loadfriends', function (req, res) {
  var username = req.body.username;
  UserModel.loadFriends(username, function (err, users) {
    if (err) {
      console.log('loadfriends err!');
    }
    if (users.length == 0) {
      console.log('no friend yet!');
    } else {
      console.log('The first friend:', users.friends[0].username);
      res.json(users);
    }
  })
});

// 拉取群列表
router.post('/loadgroups', function (req, res) {
  var username = req.body.username;
  UserModel.loadGroups({ username: username }, function (err, users) {
    if (err) {
      console.log('loadgroups err!');
    }
    if (users.length == 0) {
      console.log('no group yet!');
    } else {
      console.log('The first group:', users.groups[0].groupname);
      res.json(users.groups);
    }
  });
});

// 拉取好友请求
router.post('/loadfriendrequest', function (req, res) {
  var username = req.body.username;
  UserModel.findOne({ username: username })
    .populate('response_friends')
    .exec(function (err, users) {
      if (err) { console.log('loadfgroups err!'); }
      if (users.length == 0) {
        console.log('no group yet!');
      } else {
        console.log('The first group:', users.response_friends[0].groupname);
        res.json(users.response_friends);
      }
    });

});

// 拉取好友进群请求
router.post('/loadgrouprequesst', function (req, res) {
});

// 添加好友请求
router.post('/addfriend', function (req, res) {
  var username = req.body.username;
  var _ids = req.body._ids.split(";");
  UserModel.addFriend(username, ids,
    function (err, raw) {
      if (err) {
        // todo
        res.json(err);
      } else {
        res.json(raw);
      }
      console.log('ret:', raw);
    })
});

// 添加好友进群
router.post('/addgroupmember', function (req, res) {

});

// 同意/拒绝好友邀请
router.post('/res_addfriend', function (req, res) {

});

// 同意/拒绝进群
router.post('/res_addgroupmember', function (req, res) {

});



// ==========FOR TEST ===========
// 加载所有用户
router.post('/loadallusers', function (req, res) {
  UserModel.find()
    .exec(function (err, users) {
      if (err) { }
      if (users.length == 0) {
        console.log('no user yet!');
      } else {
        console.log('The first user:', users[0].username);
        res.json(users);
      }
    });
});

// 加载所有用户
router.post('/loadallgroups', function (req, res) {
  GroupModel.find()
    .exec(function (err, groups) {
      if (err) { }
      if (groups.length == 0) {
        console.log('no group yet!');
      } else {
        console.log('The first group:', groups[0].username);
        res.json(groups);
      }
    });
});

// 添加群
router.post('/addGroup', function (req, res) {
  // 添加进用户表中group字段
  // 在group中members中添加群成员
  var groupname = req.body.groupname;
  var members = req.body.members;
  var groupimg = req.body.groupimg ? req.body.groupimg : '';
  var GroupEntity = new GroupModel({ groupname: groupname, members: members, groupimg: groupimg });
  GroupEntity.save(function (err, doc) {
    console.log(doc)
    if (err) {
      res.json({ state: -1, message: err });
    } else {
      // 需要在这里发起进群请求
      res.json({ state: 1, user: doc });
    }
  });
});

module.exports = router;

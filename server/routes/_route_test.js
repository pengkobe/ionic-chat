// ==========FOR TEST ===========
// 加载所有用户
router.post("/loadallusers", function(req, res) {
  UserModel.find().exec(function(err, users) {
    if (err) {
    }
    if (users.length == 0) {
      console.log("no user yet!");
    } else {
      console.log("The first user:", users[0].username);
      res.json(users);
    }
  });
});

// 加载所有用户
router.post("/loadallgroups", function(req, res) {
  GroupModel.find().exec(function(err, groups) {
    if (err) {
    }
    if (groups.length == 0) {
      console.log("no group yet!");
    } else {
      console.log("The first group:", groups[0].username);
      res.json(groups);
    }
  });
});

// 添加好友请求
router.post("/addfriend", function(req, res) {
  var userid = req.body.userid;
  var _ids = req.body._ids.split(";");
  UserModel.addFriend(userid, _ids, function(err, raw) {
    if (err) {
      // todo
      res.json(err);
    } else {
      res.json(raw);
    }
    console.log("ret:", raw);
  });
});

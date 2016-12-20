// 创建群组
var jwt = require("jsonwebtoken");
var config = require("../config/config");
var cert = config.jwt.cert;
exports.createToken = function (req, res) { //成功
    var username = req.body.username,
        password = req.body.password;
    var user = {
        username: 'chengh',
        password: '123',
    };
    if (user !== null) {
        if (user.password === password) {
            var token = jwt.sign({
                uid: user._id,
                name: user.name,
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 //1 hours
            }, cert);
            return token;
        } else {
            console.log('401 密码错误')
        }
    } else {
        console.log('401 用户名错误');
    }
}
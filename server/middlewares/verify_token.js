"use strict";
var config = require("../config/config.js"), jwt = require("jsonwebtoken");
module.exports = function(req, res, next) {
  var token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "ionchat"
  ) {
    var token = req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    var token = req.query.token;
  }
  if ("" === token) {
    console.log(
      "jsonwebtoken err",
      "401 no token detected in http header 'Authorization'"
    );
  }
  console.log("req jsonwebtoken:", token);
  console.log("config.jwt.cert:", config.jwt.cert);
  var tokenContent;
  jwt.co_verify(token, config.jwt.cert)(function(err, tokenContent) {
    if (err) {
      // 处理错误
      console.log("Authorization err", err);
      var err = new Error("Authorization err");
      err.status = 401;
      next(err);
    } else {
      console.log("Authorization tokenContent", tokenContent);
      next();
    }
  });
};

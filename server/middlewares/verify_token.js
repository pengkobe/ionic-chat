"use strict"
var config = require('../config/config.js'),
    jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
    var authorization = '';
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'ionchat') {
        var authorization = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        var authorization = req.query.token;
    }
    if ('' === authorization) {
        console.log("jsonwebtoken err", '401 no token detected in http header \'Authorization\'');
    }
    var token = authorization.split(' ')[1];
    console.log("req jsonwebtoken:", authorization);
    console.log("config.jwt.cert:", config.jwt.cert);
    var tokenContent;
    try {
        jwt.co_verify(token, config.jwt.cert)(function (tokenContent) {
            console.log("Authorization tokenContent", tokenContent);
            // ctx.token = tokenContent;
            next();
        });
    } catch (err) {
        console.log("jsonwebtoken err", err);
    }

};

var express = require('express');
var router = express.Router();
var https = require('https');
var settings = require('../settings');

var User = require('../models/user.js');

var qr = require('qr-image');
var fs = require("fs");
var ObjectID = require('mongodb').ObjectID;

router.post('/login', checkLogin);
router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

});
module.exports = router;

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var settings = require('./settings');
// 路由
var routes = require('./routes/index');
var routes_app = require('./routes/app-server');
var dealWechat = require('./routes/dealWechat');

var app = express();
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' hietech-nodejs')
    //res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, '/public/img/favicon.ico')));
app.use(logger('dev'));
// 指定请求头最大值为10m
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {maxAge : 86400000}));

// session mongodb
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    url: settings.dbUrl
  })
}));

var wechat = require('wechat');

//var config = {
//  token: 'pengyi_kobepeng',
//  appid: 'wx73c22f5b3c841dd2',
//  encodingAESKey: 'xkFi3jisAGd7iNbYkftRly0UicQsAL953a2BNyV3B3d'
//};
//var secret = '136c70fe1c4698a3508a26d6de12bb25';

var config = {
  token: 'kobepeng',
  appid: 'wx888300469dbe9436',
  encodingAESKey: 'xkFi3jisAGd7iNbYkftRly0UicQsAL953a2BNyV3B3d'
};
var secret = 'd4624c36b6795d1d99dcf0547af5443d';

app.use(express.query());

app.use('/app', routes_app);
app.use('/', routes);
app.use('/wechat', wechat(config, dealWechat));

/// 404
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// 开发模式
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// 错误处理
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: '服务器未知错误，刷新试试？',
        error: {}
    });
});


module.exports = app;

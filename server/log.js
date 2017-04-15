/**
 * log
 * buit by yipeng at 2017-04-15
 */
var log4js = require('log4js');
// refer to：https://github.com/chalk/chalk
var chalk = require('chalk');
console.log(chalk.blue('日志初始化...'));

log4js.configure({
    appenders: [
        { type: 'console', category: 'info', maxLogSize: 20480 },
        { type: 'file', filename: 'logs/error.log', category: 'error', maxLogSize: 20480 },
        { type: 'file', filename: 'logs/warn.log', category: 'warn', maxLogSize: 20480 }
    ]
});

var _info_logger = log4js.getLogger('info');
_info_logger.setLevel('INFO');
var _error_logger = log4js.getLogger('error');
_error_logger.setLevel('ERROR');
var _warn_logger = log4js.getLogger('warn');
_warn_logger.setLevel('WARN');


module.exports = {
    log: function (msg, detail) {
        if (!detail) {
            _info_logger.info(msg);

        } else {
            detail = JSON.stringify(detail);
            _info_logger.info(msg + detail);
        }
    },
    err: function (msg) {
        _error_logger.info(msg);
    },
    warn: function (msg) {
        _warn_logger.info(msg);
    }
}



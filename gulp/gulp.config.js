var config = {};

var chat = './src/client/';
config.path = {
    client: client
};

config.fn = {
    log: log
};

function log() { }

module.exports = config;
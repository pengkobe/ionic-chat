module.exports = function () {
    // dependencies used in this file
    var wiredep = require('wiredep');
    var bowerJson = require('../bower.json');
    var gulp = require('gulp');
    var gUtil = require('gulp-util');
    var gInject = require('gulp-inject');
    var gIf = require('gulp-if');
    var gOrder = require('gulp-order');
    // base folder
    var _root = './www/';
    var _moduleBase = _root + 'module/';
    var _distBase = _root + 'dist/';
    // moudle folder
    var moudle = {
        base: _moduleBase,
    };
    // dist folder
    var dist = {
        base: _distBase,
        dev: _distBase + 'dev/',
        temp: _distBase + '.temp/',
    };
    // node dependency
    var nodeModules = _root + 'node_modules/';
    // bower dependency
    // var bowerFiles = wiredep({ devDependencies: true })['js'];
    var bower = {
        json: bowerJson,
        source: _root + 'lib/',
        target: dist.dev + 'static/vendor/',
        mockDeps: [
            dist.dev + 'static/vendor/angular-mocks/angular-mocks.js'
        ]
    };

    // all configuration which will be returned
    var config = {
        // folders
        root: _root,
        moudle: moudle,
        dist: dist,
        // js
        js: {
            all: [
                moudle.base + '**/*.js',
                _root + '*.js'
            ],
            app: {
                source: [
                    moudle.base + '**/*.js'
                ],
                target: [
                    dist.dev + 'static/**/*.js',
                    '!' + dist.dev + 'static/vendor/**/*.*'
                ],
                production: [
                    moudle.base + '**/production/*.js'
                ]
            },
            order: [
                '*/js/*.service.js',
                '*/js/*.route.js',
                '*/js/*.filter.js',
                '*/js/*.directive.js',
                '*/js/*.controller.js',
                '*/directives/**/*.js',
                '*/pages/**/*.js',
                '*/**/*.module.js',
                '*/js/*.js',
                'app/js/app.js',
            ]
        },
        // css
        css: {
            source_sass: moudle.base + '**/*.scss',
            source: moudle.base + '**/*.css',
            target: [
                dist.dev + 'static/**/*.css',
                '!' + dist.dev + 'static/vendor/**/*.*'
            ],
            singleSource: './scss/**/*.scss'
        },
        // html
        html: {
            source: _root + 'index.html',
            target: dist.dev + 'index.html'
        },
        templateCache: {
            sourceJade: moudle.app + '**/*.jade',
            sourceHtml: [
                dist.dev + 'static/**/*.html',
                '!' + dist.dev + 'static/vendor/**/*.*',
            ],
            target: 'templates.js',
            options: {
                module: 'app.core',
                root: 'static/',
                standAlone: false
            }
        },
        resource: {
            images: _root + 'assets/**/*.*',
            fonts: bower.source + 'mdi/fonts/*.*',
        },
        bower: bower,
        browserSync: {
            hostName: 'localhost',
            reloadDelay: 1000,
            defaultPort: 8088
        },
        optimized: {
            allCSS: '*.css',
            appJS: 'app.js',
            libJS: 'lib.js'
        },
        packages: [
            _root + 'package.json',
            _root + 'bower.json'
        ]
    };

    config.wiredepOption = getWiredepDefaultOptions();

    // common functions used by multiple tasks
    config.fn = {};
    config.fn.log = log;
    config.fn.inject = inject;

    return config;

    ////////////////

    // Options for wiredep
    function getWiredepDefaultOptions() {
        return {
            bowerJson: config.bower.json,
            directory: config.bower.target
        };
    }

    // Log function for both object type and primitive type
    function log(msg) {
        if (typeof (msg) === 'object') {
            for (var item in msg) {
                if (msg.hasOwnProperty(item)) {
                    gUtil.log(gUtil.colors.blue(msg[item]));
                }
            }
        } else {
            gUtil.log(gUtil.colors.blue(msg));
        }
    }

    // Helper function for gulp-inject
    function inject(src, label, order) {
        var options = {
            //read: false,
            relative: true,
            ignorePath: '/www/dist/dev'
        };
        if (label) {
            options.name = 'inject:' + label;
        }

        return gInject(orderSrc(src, order), options);
    }

    function orderSrc(src, order) {
        //order = order || ['**/*'];
        return gulp
            .src(src)
            .pipe(gIf(order, gOrder(order)));
    }
};

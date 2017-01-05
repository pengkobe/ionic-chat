module.exports = function () {
    // dependencies used in this file
    var wiredep = require('wiredep');
    var bowerJson = require('../../bower.json');
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
        common: _root + 'common/',
        test:_root + 'test'
    };
    // dist folder
    var dist = {
        base: _distBase,
        dev: _distBase + 'dev/',
        temp: _distBase + '.temp/',
        prod: _root + 'prod/'
    };
    // node dependency
    var nodeModules = _root + 'node_modules/';
    // bower dependency
    var bowerFiles = wiredep({ devDependencies: true })['js'];
    var bower = {
        json: bowerJson,
        source: _root + 'lib/',
        // target: dist.dev + 'static/lib/',
        // 暂时不移动
        target: _root + 'lib/',
        mockDeps: [
            dist.dev + 'static/lib/angular-mocks/angular-mocks.js'
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
                    '!' + dist.dev + 'static/lib/**/*.*'
                ],
                production: [
                    moudle.base + '**/production/*.js'
                ]
            },
            order: [
                'common/*/*.js',
                '*/js/*.service.js',
                '*/js/*.route.js',
                '*/js/*.filter.js',
                '*/js/*.directive.js',
                '*/js/*.controller.js',
                '*/directives/**/*.js',
                '*/pages/**/*.js',
                '*/**/*.module.js',
                '*/js/*.js',
                'app/js/app.*.js',
                'app/js/app.js'
            ],
            test: {
                stubs: [
                    moudle.test + 'e2e/mocks/**/e2e.*.js'
                ],
                unit: {
                    specs: [
                        moudle.test + 'unit/specs/**/*.spec.js'
                    ]
                }
            },
        },
        // css
        css: {
            source_sass: moudle.base + '**/*.scss',
            source: [
                moudle.base + '**/*.css'
            ],
            target: [
                dist.dev + 'static/**/*.css',
                '!' + dist.dev + 'static/lib/**/*.*'
            ],
            singleSource: './scss/**/*.scss'
        },
        // html
        html: {
            moudle_source: [
                _root + 'module/**/*.tpl',
                _root + 'module/**/*.html',
            ],
            source: _root + 'index_dev.html', //_root + 'index.html',
            target: _root + 'index.html' //dist.dev + 'index.html'
        },
        templateCache: {
            sourceJade: moudle.app + '**/*.jade',
            sourceHtml: [
                dist.dev + 'static/**/*.html',
                dist.dev + 'static/**/*.tpl',
                '!' + dist.dev + 'static/lib/**/*.*',
            ],
            target: 'templates.js',
            options: {
                module: 'app.core',
                root: 'dist/dev/static/',
                standAlone: false
            }
        },
        resource: {
            images: _root + 'assets/**/*.*',
            fonts: bower.source + 'font/*.*',
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

    
    config.karmaOption = getKarmaOptions();
    config.wiredepOption = getWiredepDefaultOptions();
    config.protractorOption = getProtractorOptions();

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

    // Options for karma
    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                moudle.base + '**/*.module.js',
                moudle.base + '**/*.js',
                config.js.test.unit.specs
            ),
            exclude: [],
            coverage: {
                dir: moudle.test + 'unit/results/coverage',
                reporters: [
                    // reporters not supporting the `file` property
                    { type: 'html', subdir: '.' },
                    { type: 'text-summary' }
                ]
            },
            junit: moudle.test + 'unit/results/unit-test-results.xml',
            preprocessors: {}
        };
        options.preprocessors[config.js.test.unit.specs] = ['coverage'];
        return options;
    }

    // Options for protractor
    function getProtractorOptions() {
        // options used in protractor.conf.js need to be based on it's own path
        return {
            specs: [moudle.test + 'e2e/specs/*.spec.js'],
            suites: {
                home: '.' + moudle.test + 'e2e/specs/dash.spec.js',
                login: '.' + moudle.test + 'e2e/specs/login.spec.js',
                dashboard: '.' + moudle.test + 'e2e/specs/chat.spec.js',
                phone: '.' + moudle.test + 'e2e/specs/account.spec.js'
            },
            helper: '.' + moudle.test + 'e2e/helper',
            screenshotDir: moudle.test + 'e2e/screenshots/'
        };
    }

};

module.exports = function () {
    var gulp = require('gulp');
    var gUtil = require('gulp-util');
    var gInject = require('gulp-inject');
    var gIf = require('gulp-if');
    var gOrder = require('gulp-order');

    // 加载 bower 安装的第三方模块
    var wiredep = require('wiredep');
    var bowerJson = require('../../bower.json');

    // base 文件夹
    var _root = './www/';
    // 源代码
    var _moduleBase = _root + 'module/';
    // 打包目录
    var _devBase = _root + 'dev/';

    // src_module folder
    var src_module = {
        base: _moduleBase,
        common: _root + 'common/',
        test: _root + 'test/',
        test_src_dir: './module/',
        test_base_dir: './test/',
    };
    
    // dist folder
    var dist = {
        base: _devBase,
        dev: _devBase + '/',
        temp: _devBase + '.temp/',
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
        src_module: src_module,
        dist: dist,
        // js
        js: {
            all: [
                src_module.base + '**/*.js',
                _root + '*.js'
            ],
            app: {
                source: [
                    src_module.base + '**/*.js'
                ],
                target: [
                    dist.dev + 'static/**/*.js',
                    '!' + dist.dev + 'static/lib/**/*.*'
                ],
                production: [
                    src_module.base + '**/production/*.js'
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
                    src_module.test_base_dir + 'e2e/mocks/**/e2e.*.js'
                ],
                unit: {
                    specs: [
                        src_module.test_base_dir + 'unit/specs/**/*.spec.js'
                    ]
                }
            },
        },
        // css
        css: {
            source_sass: src_module.base + '**/*.scss',
            source: [
                src_module.base + '**/*.css'
            ],
            target: [
                dist.dev + 'static/**/*.css',
                '!' + dist.dev + 'static/lib/**/*.*'
            ],
            singleSource: './scss/**/*.scss'
        },
        // html
        html: {
            src_module_source: [
                _root + 'module/**/*.tpl',
                _root + 'module/**/*.html',
            ],
            source: _root + 'index_dev.html', 
            target: _root + 'index.html' 
        },
        templateCache: {
            sourceHtml: [
                dist.dev + 'static/**/*.html',
                dist.dev + 'static/**/*.tpl',
                '!' + dist.dev + 'static/lib/**/*.*',
            ],
            target: 'templates.js',
            options: {
                module: 'app.core',
                root: 'dev/static/',
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
            defaultPort: 8100
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
                'lib/cordova-app-loader/dist/cordova-app-loader-complete.min.js',
                'lib/cordova-app-loader/dist/bootstrap.js',
                src_module.test_src_dir + 'common/**/*.js',
                src_module.test_src_dir + '**/*.directive.js',
                src_module.test_src_dir + '**/*.service.js',
                src_module.test_src_dir + '**/*.js',
                src_module.test_src_dir + '**/*.module.js',
                config.js.test.unit.specs
            ),
            exclude: [],
            coverage: {
                dir: src_module.test_base_dir + 'unit/results/coverage',
                reporters: [
                    // reporters not supporting the `file` property
                    { type: 'html', subdir: '.' },
                    { type: 'text-summary' }
                ]
            },
            junit: src_module.test_base_dir + 'unit/results/unit-test-results.xml',
            preprocessors: {}
        };
        options.preprocessors[config.js.test.unit.specs] = ['coverage'];
        return options;
    }

    // Options for protractor
    function getProtractorOptions() {
        // options used in protractor.conf.js need to be based on it's own path
        return {
            specs: [src_module.test + 'e2e/specs/*.spec.js'],
            suites: {
                home: '.' + src_module.test_base_dir + 'e2e/specs/dash.spec.js',
            },
            helper: '.' + src_module.test_base_dir + 'e2e/helper.js',
            screenshotDir: src_module.test + 'e2e/screenshots/'
        };
    }

};

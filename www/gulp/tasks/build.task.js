module.exports = function (gulp, config, $, args) {

    var runSeq = require('run-sequence');

    // Build for development environment
    gulp.task('build:dev', [], function (done) { // 'lint' 'clean', 
        runSeq('clean', 'copy:html', 'styles', 'inject:bower', //
            'inject:js:css', ['copy:images', 'copy:fonts'], done);// ,
    });

    // Build for production environment
    gulp.task('build:prod', function (done) {
        // set a flag on args so sub task can know it is production build
        args.prod = true;
        runSeq('build:dev', 'templatecache', 'optimize',
            'copy:images:prod', 'copy:fonts:prod', 'clean:temp', done);
    });


    /**
     * For relase as WEB APP
     */
    gulp.task('optimize', function () {
        config.fn.log('Optimizing the js, css, and html');
        // TypeError: useref.assets is not a function
        // var assets = $.useref.assets({ searchPath: config.dist.dev });
        // Filters are named for the gulp-useref path
        var cssFilter = $.filter(['**/' + config.optimized.allCSS], {restore: true});
        var jsAppFilter = $.filter(['**/' + config.optimized.appJS], {restore: true});
        var jslibFilter = $.filter(['**/' + config.optimized.libJS], {restore: true});

        var templateCache = config.dist.temp + config.templateCache.target;

        return gulp
            .src(config.html.target)
            .pipe($.plumber())
            .pipe(config.fn.inject(templateCache, 'templates'))
            .pipe($.useref())
            //.pipe(assets) // Gather all assets from the html with useref
            // Get the css
            .pipe(cssFilter)
            .pipe($.csso())
            .pipe(cssFilter.restore) //()
            // Get the custom javascript
            .pipe(jsAppFilter)
            .pipe($.ngAnnotate({ add: true }))
            .pipe($.uglify())
            .pipe(getHeader())
            .pipe(jsAppFilter.restore) //()
            // Get the vendor javascript
            .pipe(jslibFilter)
            .pipe($.uglify())
            .pipe(jslibFilter.restore) //()
            // Take inventory of the file names for future rev numbers
            .pipe($.rev())
            // Apply the concat and file replacement with useref
            //.pipe(assets.restore())
            
            // Replace the file names in the html with rev numbers
            .pipe($.revReplace())
            .pipe(gulp.dest(config.dist.prod));
    });

    ///////////

    function getHeader() {
        var pkg = require('../../../package.json');
        var template = ['/**',
            ' * <%= pkg.name %> - <%= pkg.description %>',
            ' * @authors <%= pkg.authors %>',
            ' * @version v<%= pkg.version %>',
            ' * @link <%= pkg.homepage %>',
            ' * @license <%= pkg.license %>',
            ' */',
            ''
        ].join('\n');
        return $.header(template, {
            pkg: pkg
        });
    }

};

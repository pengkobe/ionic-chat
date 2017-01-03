module.exports = function (gulp, config, $, args) {

    var port = process.env.PORT || config.browserSync.defaultPort;
    var historyApiFallback = require('connect-history-api-fallback');

    /**
     * serve the development environment
     * --mock: inject mock files
     */
    gulp.task('serve:dev', ['build:dev'], function () {
        monitorFileChanges(true);
    });

    /**
     * serve the production environment
     * --mock: inject mock files
     */
    gulp.task('serve:prod', ['build:prod'], function () {
        monitorFileChanges(false);
    });

    ///////////

    function monitorFileChanges (isDev) {
        config.fn.log('Starting BrowserSync on port ' + port);

        // only watch files for development environment
        var watchedFiles = [].concat(
            config.js.app.source,
            config.css.singleSource,
            config.html.source
        );
        if (args.mock) {
            watchedFiles = watchedFiles.concat(config.js.test.stubs);
        }
        if (isDev) {
            gulp.watch(watchedFiles, ['build:dev'])
                .on('change', changeEvent);
        }

        var baseDir = isDev ? config.dist.dev : config.dist.prod;
    }

    function changeEvent (event) {
        var srcPattern = new RegExp('/.*(?=/' + config.client.source + ')/');
        config.fn.log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
    }

};

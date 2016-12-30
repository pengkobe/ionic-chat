module.exports = function (gulp, config, $, args) {

    var del = require('del');

    // Remove all files from the dist dev folder
    gulp.task('clean:dev', function (done) {
        clean(config.dist.dev, done);
    });

    // Remove all files from the dist prod folder
    gulp.task('clean:prod', function (done) {
        clean(config.dist.prod, done);
    });

    // Remove all files from the dist folder
    gulp.task('clean', function (done) {
        clean(config.dist.base, done);
    });

    // Remove all image files from the dist folder
    gulp.task('clean:images', function (done) {
        clean(config.dist.dev + 'static/images/**/*.*', done);
    });

    // Remove all font files from the dist folder
    gulp.task('clean:fonts', function (done) {
        clean(config.dist.dev + 'static/fonts/**/*.*', done);
    });

    // Remove all style files from the dist folders
    gulp.task('clean:styles', function (done) {
        clean(config.dist.dev + 'static/styles/*.css', done);
    });

    // Remove all javascript files from the dist folders
    gulp.task('clean:js', function (done) {
        clean(config.js.app.target, done);
    });

    // Remove all html files from the dist folders
    gulp.task('clean:html', function (done) {
        var files = [].concat(
            config.dist.dev + 'index.html',
            config.dist.dev + 'static/**/*.html'
        );
        clean(files, done);
    });

    // Remove all files from the temp folder
    gulp.task('clean:temp', function (done) {
        clean(config.dist.temp, done);
    });

    // Remove all bower dependency files from the dist folder
    gulp.task('clean:vendor', function (done) {
        clean(config.dist.dev + 'static/vendor', done);
    });

    /////////

    // Log and delete the path
    function clean (path, done) {
        config.fn.log('Cleaning: ' + $.util.colors.blue(path));
        del(path, done);
    }
};

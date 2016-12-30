module.exports = function (gulp, config, $, args) {
    gulp.task('git-check', function (done) {
        if (!sh.which('git')) {
            console.log(
                '  ' + $.util.colors.red('Git is not installed.'),
                '\n  Git, the version control system, is required to download Ionic.',
                '\n  Download git here:', $.util.colors.cyan('http://git-scm.com/downloads') + '.',
                '\n  Once git is installed, run \'' + $.util.colors.cyan('gulp install') + '\' again.'
            );
            process.exit(1);
        }
        done();
    });

}
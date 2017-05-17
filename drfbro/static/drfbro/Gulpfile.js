var gulp = require('gulp');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('babel', function(){
    return gulp.src('./src/*.jsx')
        .on('error', function(e) {
            console.log('Error', e);
        })
        .pipe(babel({
            plugins: [
                'transform-react-jsx'
            ],
            presets: [
                'es2015'
            ]
        }))
        .pipe(gulp.dest('./gen/'))
    ;
});

gulp.task('browserify', ['babel'], function() {
    return browserify('./gen/app.js')
        .bundle()
        // Pass desired output filename to vinyl-source-stream
        .pipe(source('bundle.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./gen/'));
    ;
});

gulp.task('build', ['babel', 'browserify']);

gulp.task('watch', ['build'], function () {
    gulp.watch('./src/*.jsx', ['build']);
});

gulp.task('default', ['build', 'watch']);

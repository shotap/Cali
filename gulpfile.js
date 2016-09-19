var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    less = require('gulp-less'),
    path = require('path');

gulp.task('less', function () {
    return gulp.src('src/**/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('dist'));
});


gulp.task('scripts', function() {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            out: 'main.js'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['scripts'], function () {
    gulp.watch('./**/*.ts', ['scripts']);
    gulp.watch('./**/*.less', ['less']);
});

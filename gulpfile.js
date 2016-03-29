/**
 * Created by Oleg Galaburda on 26.12.15.
 */
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var include = require('gulp-include');

gulp.task('build-nowrap', function(callback) {
  gulp.src('source/deferred-data-access-nowrap.js')
    .pipe(include())
    .pipe(rename('deferred-data-access.nowrap.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'))
    .on('finish', function() {
      callback();
    });
});

gulp.task('build', ['build-nowrap'], function() {
  gulp.src('source/deferred-data-access-umd.js')
    .pipe(include())
    .pipe(rename('deferred-data-access.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));

});

gulp.task('build-standalone', ['build-nowrap'], function() {
  gulp.src('source/deferred-data-access-umd.standalone.js')
    .pipe(include())
    .pipe(rename('deferred-data-access.standalone.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));

});

gulp.task('default', ['build-nowrap', 'build', 'build-standalone']);

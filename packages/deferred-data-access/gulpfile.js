/**
 * Created by Oleg Galaburda on 26.12.15.
 */
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var include = require('gulp-include');
var jsdoc = require('gulp-jsdoc3');
var gulpJsdoc2md = require('gulp-jsdoc-to-markdown');

gulp.task('doc-md', ['build-nowrap'], function() {
  return gulp.src('dist/deferred-data-access.nowrap.js')
    .pipe(rename('api.md'))
    .pipe(gulpJsdoc2md({}))
    .on('error', function(err) {
      console.log('jsdoc2md failed:', err.message);
    })
    .pipe(gulp.dest('dist'))
});

gulp.task('doc', ['build-nowrap'], function() {
  return gulp.src('dist/deferred-data-access.nowrap.js', {read: false})
    .pipe(jsdoc({
      opts: {
        destination: './docs/'
      }
    }));
});

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

gulp.task('default', ['doc-md']);

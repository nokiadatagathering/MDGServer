'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

gulp.task('develop', function () {

  return $.nodemon({
    script: 'app.js',
    ext: 'html js jade',
    tasks: ['styles', 'inject'],  /*requires Node v0.12*/
    env: {'NODE_ENV': 'development'}
  })
  .on('restart', function () {
    console.log('restarted!')
  })
});

gulp.task('prod', function () {

  return $.nodemon({
    script: 'app.js',
    ext: 'html js jade',
    tasks: ['styles', 'inject'],  /*requires Node v0.12*/
    env: {'NODE_ENV': 'production'}
  })
  .on('restart', function () {
    console.log('restarted!')
  })
});

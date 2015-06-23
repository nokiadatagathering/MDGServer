'use strict';

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e',
  jade: 'app/views'
};

require('require-dir')('./gulp');

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('fixtures', function () {
  nodemon({ script: 'tasks/load_fixture_images.js'
    , ext: 'js'})
});


gulp.task('develop', function () {
  nodemon({ script: 'app.js'
    , ext: 'html js'
    , tasks: ['partials', 'styles', 'fixtures'] })
    .on('restart', function () {
      console.log('restarted!')
    })
});

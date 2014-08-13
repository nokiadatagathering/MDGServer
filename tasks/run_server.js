process.env.NODE_ENV = 'testing';

var app = require('../app'),
  Configuration = require('../app/helpers/Configuration');

module.exports = function (grunt) {
  grunt.registerTask('run_server', 'Run server for testing', function () {
    var done = this.async();
    app.run(Configuration.get('tests.mongodbUrl'), Configuration.get('tests.port'), done);
  });
};

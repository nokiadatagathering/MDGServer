var
  mongoose = require('mongoose'),
  grid = require('gridfs-stream'),
  _ = require('underscore'),
  fs = require('fs'),
  path = require('path'),

  pathToImages = '../../specs/resources/images/',
  fileNames = ['test_image_1.jpg', 'test_image_2.jpg'],

  gridfs,
  writestream;


module.exports = function (grunt) {
  grunt.registerTask('load_fixture_images', 'Load fixture images to gridfs', function () {
    var gridfs = grid(mongoose.connection.db, mongoose.mongo);

    _.each(fileNames, function (fileName) {
      writestream = gridfs.createWriteStream({
        filename: fileName
      });

      fs.createReadStream(path.resolve(__dirname + pathToImages + fileName)).pipe(writestream);
    });
  });
};

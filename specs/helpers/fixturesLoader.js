var Configuration = require('../../app/helpers/Configuration');
var fixtures = require('pow-mongodb-fixtures').connect(Configuration.get('tests.mongodbUrl'));
var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
var mongoose = require('mongoose');

require('../../app/models/ChartRequest');
var db = mongoose.connect(Configuration.get('tests.mongodbUrl'));

function loadFixtures(cb) {
  var fixturesData = {};
  var files = fs.readdirSync(__dirname + '/../../fixtures').forEach(function (file) {
    if (file === 'ids.js') { return; }
    var data = require(__dirname + '/../../fixtures/' + file);
    fixturesData = _.extend(fixturesData, data);
  });
  fixtures.clearAllAndLoad(fixturesData, function () {
    mongoose.connection.close();
    fixtures.close(cb);
  });
}


exports.addToSuite = function (suite) {
return  suite
    .addBatch({
      "before testing": {
        topic: function () {
          var me = this;
          var collections = db.connection.collections;
          loadFixtures(this.callback);
        },
        "fixtures should be loaded": function (err) {
          assert.isUndefined(err); 
        }
      }
    });
}

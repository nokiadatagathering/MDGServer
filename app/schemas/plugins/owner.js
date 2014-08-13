var mongoose = require('mongoose');

module.exports = function (schema, options) {
  schema.add({ _owner: mongoose.Schema.ObjectId });
};

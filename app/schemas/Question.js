var
  mongoose = require('mongoose'),
  Schema;

Schema =  new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  mediatype: {
    type: String
  },
  tagName: {
    type: String,
    required: true
  },
  required: {
    type: Boolean
  },
  relevant: {
    type: String
  },
  defaultRelevant: {
    type: Boolean
  },
  constraint: {
    type: String
  },
  defaultValue: {
    type: String
  },
  items: {
    type: Object
  },
  mask: {
    type: String
  },
  parentid: {
    type: String
  }
});

module.exports = Schema;

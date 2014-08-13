var
  fs = require('fs'),
  _ = require('underscore'),
  async = require('async'),
  config,
  configurationSchema = require('../../configurationSchema'),
  Configuration;

try {
  config = require('../../config');
} catch (e) {
  config = {};
}

Configuration = function () {
  var
    me = this;

  function __construct (schema, config) {
    me.params = setAllConfigurationParamsValues(schema, config);
  }

  __construct(configurationSchema, config);

  this.get = function (param) {
    var
      params = param.split('.'),
      value = me.params;

    while (params.length > 0) {
      value = value[params.shift()];

      if (value === undefined) {
        throw new Error('There is no "' + param + '" param in configurationSchema');
      }
    }

    return replaceRefs(value);
  };

  this.set = function (param, value, cb) {
    var
      params = param.split('.'),
      currentValue =  me.get(param),
      valueConverted;

    try {
      valueConverted = convertParamInSchemaType(param, value, currentValue.constructor);
      config = setConfigValue(config, params, value);

      fs.writeFile('config.js', 'module.exports = ' + JSON.stringify(config), function (err) {

        if (err) {
          throw new Error(err);
        }

        me.params = setConfigValue(me.params, params, valueConverted);

        if (cb) {
          cb();
        }
      });
    } catch (err) {
      if (cb) {
        cb(err);
        return;
      }

      throw new Error(err);
    }

  };

  function replaceRefs (item) {
    var
      refFieldRegex = /\$\{([\w\.]+)\}/g,
      replacer = function (str, group) {
        return me.get(group);
      };

    if (item.constructor === String && refFieldRegex.test(item)) {
      item = item.replace(refFieldRegex, replacer);
    } else if (typeof(item) === "object") {
      for (var key in item) {
        item[key] = replaceRefs(item[key]);
      }
    }

    return item;
  }

  function setConfigValue (obj, params, value) {
    if (params.length > 1) {
        obj[params[0]] =  obj[params[0]] ? obj[params[0]] : {};

        obj[params[0]] =  setConfigValue (obj[params[0]], params.slice(1), value);
    } else {
      obj[params[0]] = value;
    }
    return obj;
  }

  function setAllConfigurationParamsValues (schema, config) {
    var
      value,
      params = {};

    for (var param in schema) {
      var configParam = config ? config[param] : undefined;

      if (schema[param].type) {
        value = configParam || schema[param].defaults;

        params[param] = convertParamInSchemaType(schema[param].title, value, schema[param].type);

      } else {
        params[param] = setAllConfigurationParamsValues(schema[param].children, configParam);
      }
    }

    return params;
  }

  function convertParamInSchemaType (param, value, schemaValueConstructor) {
    var err;

    if (value === 'false' && schemaValueConstructor === Boolean) {
      value = false;
    } else {
      try {
        value = schemaValueConstructor(value);
      } catch (e) {
       err = e;
      }
    }

    if (value === null || (schemaValueConstructor === Number && isNaN(value)) || value === undefined) {
      err = 'Config param "' + param + '" should have ' + schemaValueConstructor + ' type!';
    }

    if (err) {
      throw new Error(err);
    }

    return value;
  }
};

Configuration.instance = null;

Configuration.getInstance = function () {
  if (this.instance === null) {
    this.instance = new Configuration();
  }

  return this.instance;
};

module.exports = Configuration.getInstance();

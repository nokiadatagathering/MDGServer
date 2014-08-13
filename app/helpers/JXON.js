var
  xmldom = require('xmldom'),
  moment = require('moment'),
  sax = require('sax'),
  path = require('path'),
  fs = require('fs'),
  libxmljs = require('libxmljs'),
  schemas = [],
  schemasFiles = [ 'survey' ];

exports.WITH_VALIDATION = 1;
exports.WITHOUT_VALIDATION = 0;

schemasFiles = schemasFiles.map(function (fileName) {
  return path.resolve(__dirname, '../resources/xsd/', fileName + '.xsd');
});

schemas = schemasFiles.map(function (filePath) {
  var xml = fs.readFileSync(filePath, 'utf8');

  return libxmljs.parseXmlString(xml);
});

function parseText (sValue) {
  if (/^\s*$/.test(sValue)) {
    return null;
  }

  if (/^(?:true|false)$/i.test(sValue)) {
    return sValue.toLowerCase() === "true";
  }

  if (isFinite(sValue)) {
    return parseFloat(sValue);
  }

  if (moment(sValue, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid() || moment(sValue, 'YYYY-MM-DD', true).isValid()) {
    return new Date(sValue);
  }

  return sValue;
}

function getNode (tagName) {
  return {
    items: [],
    tagName: tagName,
    attrs: {},
    value: null
  };
}

function generateEventHandlers (callback) {
  var res = getNode('root'),
    stack = [ res ],
    attrs = {},
    handlers = {
      opentag: function (tag) {
        var node = getNode(tag.name);

        node.attrs = attrs;

        attrs = {};

        stack.push(node);
      },
      attribute: function (attr) {
        attrs[attr.name] = attr.value;
      },
      text: function (text) {
        stack[stack.length - 1].value = parseText(text);
      },
      closetag: function () {
        var node = stack.pop();

        stack[stack.length - 1].items.push(node);
      },
      end: function () {
        callback(null, res.items[0]);
      },
      error: function (err) {
        console.log(err);

        callback(err, null);
      }
    };

  return handlers;
}

function validate (xmlString) {
  var parsedXML = {};

  try {
    parsedXML = libxmljs.parseXmlString(xmlString);
  } catch (e) {
    return false;
  }

  return schemas.reduce(function (value, schema, index) {
    try {
      return value && parsedXML.validate(schema);
    } catch (e) {
      return false;
    }

  }, true);
}

exports.readFile = function (fileName, validationType, callback) {
  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) {
      callback(err, null);

      return;
    }

    parseXML(data, validationType, callback);
  });
};

function parseXML (xml, validationType, callback) {
  if (validationType && !validate(xml)) {
    callback(new Error('XML is not well formed'));

    return;
  }

  var parser = sax.parser(false, {
      lowercase: true
    }),
    handlers = generateEventHandlers(callback);

  parser.onerror = handlers.error;
  parser.onopentag = handlers.opentag;
  parser.onattribute = handlers.attribute;
  parser.onclosetag = handlers.closetag;
  parser.ontext = handlers.text;
  parser.onend = handlers.end;

  parser.write(xml).close();
}

function createXML (jxonObj) {

  var node,
    stack = [],
    obj = jxonObj,
    i = 0,
    j,
    document,
    parent = new xmldom.DOMImplementation().createDocument('', '', null),
    xmlSerializer = new xmldom.XMLSerializer(),
    xml;

  document = parent;

  stack.push({
    parent: parent,
    obj: { items: [] },
    i: 0
  });

  function upStep () {
    parent.appendChild(node);

    var stackElement = stack.pop() || {};

    node = parent;

    i = stackElement.i + 1;
    parent = stackElement.parent;
    obj = stackElement.obj;
  }

  do {
    if (i === 0) {
      node = document.createElement(obj.tagName);

      for (j in obj.attrs) {
        if (!obj.attrs.hasOwnProperty(j)) {
          continue;
        }

        node.setAttribute(j, obj.attrs[j]);
      }

      if (typeof obj.value !== 'undefined' && obj.value !== null) {
        node.appendChild(document.createTextNode(obj.value.toString()));

        upStep();

        continue;
      }
    }

    if (i < obj.items.length) {
      stack.push({
        i: i,
        parent: parent,
        obj: obj
      });

      parent = node;
      obj = obj.items[i];
      i = 0;

      continue;
    }

    upStep();
  } while (stack.length !== 0);
  xml = xmlSerializer.serializeToString(document);

  return ("<?xml version='1.0' ?>" + xml).replace(/></g, '>\n<');
}

exports.readString = parseXML;
exports.serialize = createXML;

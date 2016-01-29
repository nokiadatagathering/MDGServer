var JXON = require('../helpers/JXON');

function findTags (tree, tagName) {
  if (!tree) {
    return null;
  }

  return tree.items.filter(function (node) {
    return node.tagName.indexOf(tagName) !== -1;
  });
}

function findOneTag (tree, tagName) {
  return findTags(tree, tagName)[0] || null;
}

function getJrItext (text) {
  return text.match(/(?:jr:itext\(')(.*)(?:'\))/)[1];
}

function getKeys (obj) {
  return Object.keys ? Object.keys(obj) : _.keys(obj);
}

function Survey (jxonTree) {
  if (typeof jxonTree.nodeType !== 'undefined') { // if we take xmlDocument instead jxonTree
    jxonTree = JXON.parse(jxonTree);
  }

  this.__attrs = jxonTree.attrs;

  var head = findOneTag(jxonTree, 'head'),
    model,
    instance = null,
    itext = null,
    title,
    body,
    me = this,
    binds;

  this.title = '';

  if (head) {
    title = findOneTag(head, 'title');

    this.title = title ? title.value : this.title;
  }

  model = findOneTag(head, 'model');

  this.instance = {};
  this.defaults = {};

  function initInstance () {
    if (!instance) {
      return;
    }

    var data = findOneTag(instance, 'data');

    if (!data) {
      return;
    }

    me.instance = {
      id: data.attrs.id
    };

    me.instance.categories = data.items.map(function (category) {
      var res = {
        id: category.tagName,
        questions: []
      };

      category.items.forEach(function (question) {
        var id = question.tagName;

        res.questions.push(id);

        if (question.value !== null) {
          me.defaults[id] = question.value;
        }
      });

      return res;
    });
  }

  this.translations = {};

  function initItext () {
    if (!itext) {
      return;
    }

    var trans = findTags(itext, 'translation');

    if (trans.length === 0) {
      return;
    }

    trans.forEach(function (tran) {
      me.translations[tran.attrs.lang] = {};

      var translation = me.translations[tran.attrs.lang],
        texts = findTags(tran, 'text');

      texts.forEach(function (text) {
        translation[text.attrs.id] = findOneTag(text, 'value').value;
      });
    });
  }

  this.__binds = {};

  function initBinds () {
    if (!binds) {
      return;
    }

    binds.forEach(function (bind) {
      me.__binds[bind.attrs.nodeset] = {
        type: bind.attrs.type,
        required: bind.attrs.required === 'true()',
        constraint: bind.attrs.constraint,
        relevant: bind.attrs.relevant
      };
    });
  }

  if (model) {
    instance = findOneTag(model, 'instance');
    itext = findOneTag(model, 'itext');
    binds = findTags(model, 'bind');

    initInstance();

    initItext();

    initBinds();
  }

  body = findOneTag(jxonTree, 'body');

  this.groups = [];

  if (body) {
    this.groups = findTags(body, 'group').map(function (group) {
      var
        title = findOneTag(group, 'label'),
        res = {};

      res.title = getJrItext(title.attrs.ref);
      res.id = /\/data\/(.*):/.exec(title.attrs.ref)[1];

      if (group.attrs.ref) {
        res.relevant = me.__binds[group.attrs.ref].relevant;
      }

      res.inputs = group.items
        .filter(function (item) {
          return item.tagName !== 'label';
        })
        .map(function (item) {
          var
            id = /\/data\/.*\/(.*)/.exec(item.attrs.ref)[1],
            bind = me.__binds[item.attrs.ref],
            res = {
              type: bind.type,
              required: bind.required,
              constraint: bind.constraint || '',
              relevant: bind.relevant,
              label: getJrItext(findOneTag(item, 'label').attrs.ref),
              ref: item.attrs.ref,
              tagName: item.tagName,
              id: id,
              defaultValue: me.defaults[id]
            };

          switch (item.tagName) {
            case 'select':
            case 'select1':
              res.items = findTags(item, 'item').map(function (item) {
                return {
                  text: getJrItext(findOneTag(item, 'label').attrs.ref),
                  value: findOneTag(item, 'value').value
                };
              });

              break;

            case 'upload':
              res.mediatype = item.attrs.mediatype;

              break;
          }

          return res;
        });

      return res;
    });
  }
}

exports.SurveysToJxonTree = function (surveys, url) {
  var res = {
    attrs: {
      xmlns: "http://openrosa.org/xforms/xformsList"
    },
    tagName: 'xforms',
    value: null,
    items: getItems()
  };

  function getItems () {
    return surveys.map(function (survey) {
      return {
        tagName: 'xform',
        value: null,
        attrs: {},
        items: getItem(survey)
      };
    });
  }

  function getItem (survey) {
    return [
      {
        tagName: 'formID',
        attrs: {},
        items: [],
        value: survey._id
      },
      {
        tagName: 'name',
        attrs: {},
        items: [],
        value: survey.title
      },
      {
        tagName: 'downloadUrl',
        attrs: {},
        items: [],
        value: url + '/' + survey._id
      },
      {
        tagName: 'hash',
        attrs: {},
        items: [],
        value: survey._id
      }
    ]
  }

  return res;
};

exports.SurveyToJxonTree = function (me) {
  var
    res = {
      attrs: {
        xmlns: "http://www.w3.org/2002/xforms",
        "xmlns:h": "http://www.w3.org/1999/xhtml",
        "xmlns:ev": "http://www.w3.org/2001/xml-events",
        "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
        "xmlns:jr": "http://openrosa.org/javarosa"
      },
      tagName: 'h:html',
      value: null,
      items: [
        getHead(),
        getBody()
      ]
    };

  function getHead () {
    var head = {
      tagName: 'h:head',
      value: null,
      attrs: {},
      items: []
    }, title = {
      tagName: 'h:title',
      value: me.title,
      attrs: {},
      items: []
    };

    head.items.push(title);

    var model = {
      tagName: 'model',
      attrs: {},
      value: null,
      items: []
    };

    head.items.push(model);

    if (me.instance) {
      var instance = {
        tagName: 'instance',
        value: null,
        attrs: {},
        items: [{
          tagName: 'data',
          attrs: {
            id: me.instance.id
          },
          value: null,
          items: me.instance.categories.map(function (category) {
            return {
              value: null,
              attrs: {},
              items: category.questions.map(function (question) {
                var res = {
                  tagName: question.id,
                  attrs: {},
                  items: [],
                  value: null
                };

                if (typeof me.defaults[question.id] !== 'undefined') {
                  res.value = me.defaults[question.id];
                }

                return res;
              }),
              tagName: category.id
            };
          })
        }]
      };

      model.items.push(instance);
    }

    if (me.translations) {
      var itext = {
        tagName: 'itext',
        value: null,
        attrs: {},
        items: getKeys(me.translations).map(function (key) {
          var tran = me.translations[key];

          return {
            tagName: 'translation',
            value: null,
            attrs: {
              lang: key
            },
            items: getKeys(tran).map(function (tranKey) {
              return {
                tagName: 'text',
                value: null,
                attrs: {
                  id: tranKey
                },
                items: [{
                  tagName: 'value',
                  value: tran[tranKey],
                  attrs: {},
                  items: []
                }]
              };
            })
          };
        })
      };

      model.items.push(itext);
    }

    var binds = getKeys(me.__binds).map(function (bindKey) {
      var res = {
        tagName: 'bind',
        attrs: {
          nodeset: bindKey,
          type: me.__binds[bindKey].type
        },
        value: null,
        items: []
      };

      if (me.__binds[bindKey].required) {
        res.attrs.required = "true()";
      }

      if (me.__binds[bindKey].constraint) {
        res.attrs.constraint = me.__binds[bindKey].constraint;
      }

      if (me.__binds[bindKey].relevant) {
        res.attrs.relevant = me.__binds[bindKey].relevant;
      }

      return res;
    });

    model.items.push.apply(model.items, binds);

    return head;
  }

  function getBody () {
    var body = {
      tagName: 'h:body',
      attrs: {},
      value: null,
      items: me.groups.map(function (group) {
        var items = [{
          tagName: 'label',
          attrs: {
            ref: "jr:itext('" + group.title + "')"
          },
          items: [],
          value: null
        }];

        items.push.apply(items, group.inputs.map(function (input) {
          var res = {
            tagName: input.tagName,
            value: null,
            attrs: {
              ref: input.ref
            },
            items: [{
              tagName: 'label',
              value: null,
              items: [],
              attrs: {
                ref: "jr:itext('" + input.label + "')"
              }
            }]
          };

          if (input.items) {
            res.items.push.apply(res.items, input.items.map(function (item) {
              return {
                tagName: 'item',
                attrs: {},
                value: null,
                items: [{
                  tagName: 'label',
                  attrs: {
                    ref: "jr:itext('" + item.text + "')"
                  },
                  value: null,
                  items: []
                }, {
                  tagName: 'value',
                  attrs: {},
                  items: [],
                  value: item.value
                }]
              };
            }));
          }

          if (input.mediatype) {
            res.attrs.mediatype = input.mediatype;
          }

          return res;
        }));

        return {
          tagName: 'group',
          attrs: group.ref ? { ref: group.ref } : {},
          value: null,
          items: items
        };
      })
    };

    return body;
  }

  return res;
};

Survey.prototype.serialize = function () {
  return JXON.serialize(this.toJxonTree());
};

Survey.prototype.getText = function (label, lang) {
  if (typeof this.translations[lang] === 'undefined') {
    throw new Error('This language is not support');
  }

  return this.translations[lang][label];
};

Survey.prototype.supportLang = function (lang) {
  return typeof this.translations[lang] !== 'undefined';
};

exports.Survey = Survey;

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

function ResultsParser (jxonTree) {
  var data = jxonTree,
    meta,
    categories,
    me = this;

  me.survey = data.attrs.id;

  function initCategories () {
    if (!categories) {
      return;
    }

    me.categories = [];

    me.categories = categories.map(function (category) {
      var res = {
        id: category.tagName,
        questions: []
      };

      res.questions = category.items.map(function (question) {
        var
          resp = {
            id: question.tagName
          };

        if (question.value !== null) {
          resp.result = question.value.toString();
        }

        return resp;
      });

      return res;
    });
  }

  function initMeta () {
    if (!meta) {
      return;
    }

    me.instanceID = findOneTag(meta, 'orx:instanceid') ? findOneTag(meta, 'orx:instanceid').value : null;
    me.deviceID = findOneTag(meta, 'orx:deviceid') ? findOneTag(meta, 'orx:deviceid').value : null;
    me.timeStart = findOneTag(meta, 'orx:timestart') ? findOneTag(meta, 'orx:timestart').value : null;
    me.timeEnd = findOneTag(meta, 'orx:timeend') ? findOneTag(meta, 'orx:timeend').value : null;
    me.geostamp = findOneTag(meta, 'orx:geostamp') ? findOneTag(meta, 'orx:geostamp').value : null;
  }

  if (data) {
    meta = findOneTag(data, 'orx:meta');
    categories = data.items
      .filter(function (item) {
        return item.tagName !== 'orx:meta';
      });

    initMeta();

    initCategories();
  }
}

exports.ResultsParser = ResultsParser;

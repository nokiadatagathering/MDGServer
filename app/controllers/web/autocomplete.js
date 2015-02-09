var User = require('../../models/User');

exports.getCompanies = function (req, res, next) {
  var
    term = req.param('term'),
    termReggexp = new RegExp('.*' + term + '.*', 'i');

  if (term.length < 3) {
    res.send([]);
    return;
  }

  User.distinct('company', { company: { $regex: termReggexp } }, function (err, companies) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    res.send(companies);
  });
};

exports.getIndustries = function (req, res, next) {
  var
    term = req.param('term'),
    termReggexp = new RegExp('.*' + term + '.*', 'i');

  if (term.length < 3) {
    res.send([]);
    return;
  }

  User.distinct('industry', { industry: { $regex: termReggexp } }, function (err, industries) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    res.send(industries);
  });
};

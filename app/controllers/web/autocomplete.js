var User = require('../../models/User');

exports.getCompanies = function (req, res, next) {
  User.distinct('company', function (err, companies) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    res.send(companies);
  });
};

exports.getIndustries = function (req, res, next) {
  User.distinct('industry', function (err, industries) {
    if (err) {
      next({ status: 500, body: err });
      return;
    }

    res.send(industries);
  });
};

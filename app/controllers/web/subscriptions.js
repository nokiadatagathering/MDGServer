var
  _ = require('underscore'),
  moment = require('moment'),

  Subscription = require('../../models/Subscription'),

  ACLService = require('../../services/ACL');

module.exports = {
  all: ACLService.checkPermission,

  create: function (req, res, next) {
    var
      user = req.user,
      survey = req.params.survey,
      s;

    req.body.from = moment(req.body.from, 'DD/MM/YYYY').startOf('day');
    req.body.to = moment(req.body.to, 'DD/MM/YYYY').endOf('day');

    s = new Subscription(req.body);

    s._owner = user.owner;
    s._user = user._id;
    s._survey = survey;

    Subscription.findOne({
      _owner: s._owner,
      _user: s._user,
      _survey: s._survey,
      from: s.from,
      to: s.to,
      email: s.email
    }).exec(function (err, oldSubscription) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        if (oldSubscription) {
          res.send(200, { id: oldSubscription._id });
          return;
        }

        s.save(function (err, subscription) {
          if (err) {
            next({ status: 400, body: err });
            return;
          }

          res.send(200, { id: subscription._id });
        });
      });
  },

  index: function (req, res, next) {
    var
      user = req.user,
      survey = req.params.survey;

    Subscription.find({ _owner: user.owner, _user: user._id, _survey: survey, wassent: false })
      .exec(function (err, subscriptions) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        subscriptions = _.map(subscriptions, function (subscription) {
          var results = _.pick(subscription,
            '_user',
            '_survey',
            'email',
            '_id',
            '__v'
          );

          results.from = moment(subscription.from).format('DD/MM/YYYY');
          results.to = moment(subscription.to).format('DD/MM/YYYY');

          return results;
        });

        res.send(subscriptions);
      });
  },

  destroy: function (req, res, next) {
    var
      user = req.user,
      subscriptionId = req.params.subscription;

    Subscription.findOne({ _owner: user.owner, _id: subscriptionId }).exec(function (err, subscription) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!subscription) {
        res.send(204);
        return;
      }

      subscription.remove(function (err) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        res.send(204);
      });
    });
  }
};

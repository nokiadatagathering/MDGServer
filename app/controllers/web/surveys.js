var
  _ = require('underscore'),

  Survey = require('../../models/Survey'),
  User = require('../../models/User'),

  ACLService = require('../../services/ACL');

module.exports = {
  all: ACLService.checkPermission,

  create: function (req, res, next) {
    var
      user = req.user,
      survey;

    survey = new Survey(req.body);

    survey._owner = user.owner;
    survey._creator = user._id;

    survey.save(function (err, survey) {
      if (err) {
        next({ status: 400, body: err });
        return;
      }

      res.send(200, { id: survey._id });
    });
  },

  index: function (req, res, next) {
    var
      archive = req.param('archive') ===  'true' ? true : false,
      query = {};

    query._owner = req.user.owner.toString();

    if (archive) {
      query.archive = archive;
    } else {
      query.$and = [{ $or: [{ archive: false }, { archive: { $exists: false } }] },
        { $or: [{ deleted: false }, { deleted: { $exists: false } }] }];
    }

    Survey.find(query).populate('_creator', 'firstName lastName name').exec(function (err, surveys) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      surveys = _.map(surveys, function (survey) {
        return survey.toObject();
      });

      res.send(surveys);
    });
  },

  show: function (req, res, next) {
    var
      owner = req.user.owner.toString(),
      surveyId = req.params.survey,
      usersOptions = {
      };

    Survey
      .findOne({ _id: surveyId, _owner: owner, $or: [{ deleted: false }, { deleted: { $exists: false } }] })
      .populate('_creator', 'firstName lastName')
      .exec(function (err, survey) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!survey) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
        return;
      }

      usersOptions["_surveys." + surveyId] =  { $exists: true };

      User.find(usersOptions, 'firstName lastName').exec(function (err, users) {
        if (err) {
          next({ status: 500, body: err });
          return;
        }

        survey = survey.toObject();
        survey.sentToUsers = users;

        res.send(survey);
      });
    });
  },

  update: function (req, res, next) {
    var
      owner = req.user.owner.toString(),
      surveyId = req.params.survey,
      surveyUpdate = req.body;

    Survey.findOne({ _id: surveyId, _owner: owner }).exec(function (err, survey) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!survey) {
        next({ status: 400, body: { name: 'ValidatorError', path: 'survey', type: 'unknown' } });
        return;
      }

      if (survey.get('__v') != surveyUpdate.__v) {
        next({ status: 409, body: { name: 'ValidatorError', path: 'survey', type: 'invalidVersion' } });
        return;
      }

      survey.title = surveyUpdate.title;
      survey.published = surveyUpdate.published;
      survey.deleted = false;
      survey._categories = surveyUpdate._categories;

      survey.increment();

      survey.save(function (err, survey) {
        if (err) {
          next({ status: 400, body: err });
          return;
        }

        res.send(200, { id: survey._id });
      });
    });
  },

  destroy: function (req, res, next) {
    var
      owner = req.user.owner.toString(),
      surveyId = req.params.survey;

    Survey.findOne({ _id: surveyId, _owner: owner }).exec(function (err, survey) {
      if (err) {
        next({ status: 500, body: err });
        return;
      }

      if (!survey) {
        res.send(204);
        return;
      }

      survey.deleted = true;

      survey.save(function (err) {
        if (err) {
          next({ status: 400, body: err });
          return;
        }

        res.send(204);
      });
    });
  }
};

var
  Survey = require('../../models/Survey'),
  ImagesService = require('../../services/Images');

exports.getLogo = function (req, res, next) {
  var
    surveyId = req.params.survey;

  Survey.findOne({ _id: surveyId }).exec(function (err, survey) {
    if (err) {
      next({status: 500, body: err});
      return;
    }

    if (!survey) {
      res();
      return;
    }

    ImagesService.getImage(survey.customLogo, function (readstream) {
      if (!readstream) {
        res();
        return;
      }

      readstream.pipe(res);
    });
  });
};

var ImagesService = require('../../services/Images');

exports.getImage = function (req, res, next) {
  var filename = req.params.filename;

  ImagesService.getImage(filename, function (readstream) {
    if (!readstream) {
      res();
      return;
    }

    readstream.pipe(res);
  });
};

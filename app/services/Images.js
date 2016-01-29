var
  mongoose = require('mongoose'),
  btoa = require('btoa'),
  streamBuffers = require("stream-buffers"),
  grid = require('gridfs-stream');

exports.saveImage = function (fileData, fileName, ifBuffer) {
  var
    buf,
    gridfs,
    readstream,
    writestream;

  buf = ifBuffer ? fileData : new Buffer(fileData, 'base64');

  gridfs = grid(mongoose.connection.db, mongoose.mongo);

  writestream = gridfs.createWriteStream({
    filename: fileName,
    content_type: 'binary/octet-stream'
  });

  readstream = new streamBuffers.ReadableStreamBuffer({
    chunkSize: buf.length
  });

  readstream.put(buf);
  readstream.pipe(writestream);
};

exports.getImage = function (fileName, cb) {
  var gridfs = grid(mongoose.connection.db, mongoose.mongo);

  gridfs.exist({ filename: fileName }, function (err, found) {
    if (found) {
      cb(gridfs.createReadStream({ filename: fileName }));
      return;
    }

    cb();
  });
};

exports.getImageAsBuffer = function (fileName, cb) {
  var
    readStream,
    buffer = "",
    gridfs = grid(mongoose.connection.db, mongoose.mongo);

  gridfs.exist({ filename: fileName }, function (err, found) {
    if (found) {
      readStream = gridfs.createReadStream({ filename: fileName });

      readStream.on("data", function (chunk) {
        buffer += btoa(chunk);
      });

      readStream.on("end", function () {
        cb(buffer);
      });
    } else {
      cb();
    }
  });
};

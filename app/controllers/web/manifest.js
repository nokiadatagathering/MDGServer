var manifesto  = require('manifesto');

exports.getManifest = function (req, res, next) {
  manifesto.fetch('./mdgcache.manifest', '.', function (err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Something went wrong\n');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/cache-manifest' });
    res.end(data);
  });
};

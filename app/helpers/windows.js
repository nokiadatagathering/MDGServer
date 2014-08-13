var wincmd = require('node-windows'),
  Service = wincmd.Service,
  path = require('path'),

  filePath = path.resolve(path.join(__dirname, '../../app.js'))
;

var svc = new Service({
  name: 'Microsoft Data Gathering',
  description: 'Microsoft Data Gathering web server',
  script: require('path').resolve(filePath),
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});

svc.on('error', function (err) {
  console.log('Error', err);
  process.exit(1);
});

function uninstall () {
  wincmd.isAdminUser(function (isAdmin) {
    if (!isAdmin) {
      console.log('You should run this as admin user');
      process.exit(1);
    }

    console.log('Uninstalling service...');
    svc.on('uninstall', function () {
      console.log('Server successfully uninstalled');
      process.exit(0);
    });

    svc.uninstall();
  });
}

function install () {
  wincmd.isAdminUser(function (isAdmin) {
    if (!isAdmin) {
      console.log('You should run this as admin user');
      process.exit(1);
    }

    console.log('Installing service...');
    svc.on('install', function () {
      console.log('Successfully installed, starting...');
      svc.on('start', function () {
        console.log('Started');
        process.exit(0);
      });
      svc.start();
    });

    svc.install();

  });
}

module.exports = {
  install: install,
  uninstall: uninstall
};

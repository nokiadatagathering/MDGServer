var
  fs = require('fs'),
  _ = require('underscore'),
  roles,
  configure;

exports.roles = roles = [ 'superAdmin', 'admin', 'operator', 'fieldWorker' ];
exports.configure = configure = {
  users: {
    create: 'admin',
    show: 'operator',
    update: 'admin',
    destroy: 'admin'
  },
  groups: {
    create: 'admin',
      show: 'operator',
      update: 'admin',
      destroy: 'admin'
  },
  surveys: {
    create: 'operator',
    show: 'operator',
    update: 'operator',
    destroy: 'operator'
  },
  sms: {
    create: 'admin'
  },
  xml: {
    create: 'operator',
    show: 'operator'
  },
  duplicate: {
    create: 'operator'
  },
  archive: {
    create: 'operator'
  },
  surveysresults: {
    show: 'operator',
    destroy: 'operator'
  },
  sendSurvey: {
    create: 'operator'
  },
  chartUrl: {
    create: 'operator'
  },
  chartData: {
    create: 'operator'
  },
  chartImage: {
    show: 'operator'
  },
  resultsImage: {
    show: 'operator'
  },
  export: {
    create: 'operator'
  },
  surveyssubscriptions: {
    create: 'operator',
    show: 'operator',
    destroy: 'operator'
  },
  userPermission: {
    show: 'operator'
  }
};

exports.checkPermission = function (req, res, next) {
  var
    route = req.route,
    resourceRegexp = new RegExp('\\/([^:][a-zA-Z]+)\\/?', 'g'),
    user = req.user,
    resource = '',
    match,
    role,
    method;

  if (!user) {
    next({ status: 401 });
    return;
  }

  while ((match = resourceRegexp.exec(route.path)) !== null) {
    resourceRegexp.lastIndex = resourceRegexp.lastIndex - 1;
    resource =  resource + match[1];
  }

  if (route.method === 'post') {
    method = 'create';
  } else if (route.method === 'put') {
    method = 'update';
  } else if (route.method === 'delete') {
    method = 'destroy';
  } else {
    method = 'show';
  }

  role = configure[resource][method];

  if (roles.indexOf(role) < roles.indexOf(user.permission)) {
    if (req.files && req.files.xml) {
      fs.unlink(req.files.xml.path);
    }

    next({ status: 403, body: { name: 'PermissionError' } });
    return;
  }

  return next();
};

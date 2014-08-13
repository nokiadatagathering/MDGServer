var
  crypto = require('crypto'),
  ids = require('./ids'),
  users = {
    superAdmin: {
      _id: ids.users.superAdmin,
      username: 'Enjeru',
      password: 'q1w2e3r4',
      firstName: 'Muteki',
      lastName: 'Enjeru',
      email: 'test@mailinator.com',
      phone: 111111111111111,
      permission: 'superAdmin',
      country: 'Test Country',
      company: 'Test Company',
      industry: 'Test Industry',
      activated: true,
      deleted: false,
      _surveys: {
        '52d3c4a78705399413000002': false
      },
      __v: 0
    },
    userToActivated: {
      _id: ids.users.userToActivated,
      username: 'NotActive',
      password: 'q1w2e3r4',
      firstName: 'Not',
      lastName: 'Activate',
      email: 'notactivate@mailinator.com',
      phone: 100000111111,
      permission: 'superAdmin',
      country: 'Test Country',
      company: 'Test Company',
      industry: 'Test Industry',
      activated: false,
      deleted: false,
      _surveys: {},
      __v: 0
    },
    admin: {
      _id: ids.users.admin,
      username: 'Trisha',
      password: 'q1w2e3r4',
      firstName: 'Trisha',
      lastName: 'Miller',
      email: 'trisha@mailinator.com',
      phone: 123123123123,
      permission: 'admin',
      country: 'Test Country',
      company: 'Test Company',
      industry: 'Test Industry',
      activated: true,
      deleted: false,
      _surveys: {
        '52d3c4a78705399413000002': false
      },
      _owner: ids.users.superAdmin,
      __v: 0
    },
    operator: {
      _id: ids.users.operator,
      username: 'Olegik',
      password: 'q1w2e3r4',
      firstName: 'Oleg',
      lastName: 'Petrov',
      email: 'oleg@mailinator.com',
      phone: 321321321321,
      permission: 'operator',
      country: 'Test Country',
      company: 'Test Company',
      industry: 'Test Industry',
      activated: true,
      deleted: false,
      _surveys: {
        '52d3c4a78705399413000002': false
      },
      _owner: ids.users.superAdmin,
      __v: 0
    },
    fieldWorker: {
      _id: ids.users.fieldWorker,
      username: 'Stanley',
      password: 'q1w2e3r4',
      firstName: 'Stanley',
      lastName: 'Marsh',
      phone: 334443434234,
      permission: 'fieldWorker',
      country: 'Test Country',
      company: 'Test Company',
      industry: 'Test Industry',
      activated: true,
      deleted: false,
      _surveys: {
        '52d3c4a78705399413000002': false
      },
      _owner: ids.users.superAdmin,
      __v: 0
    },
    superAdminEditor: {
      _id: ids.users.superAdminEditor,
      username: 'Samanta',
      password: 'q1w2e3r4',
      firstName: 'Samanta',
      lastName: 'Forever',
      email: 'samanta@mailinator.com',
      phone: 1923913293,
      permission: 'superAdmin',
      country: 'Other Country',
      company: 'Other Company',
      industry: 'Other Industry',
      activated: true,
      deleted: false,
      _surveys: {},
      __v: 0
    },
    adminToEdit1: {
      _id: ids.users.adminToEdit1,
      username: 'annushka',
      password: 'q1w2e3r4',
      firstName: 'anna',
      lastName: 'ToEdit',
      email: 'anna@mailinator.com',
      phone: 2929292933,
      permission: 'admin',
      country: 'Other Country',
      company: 'Other Company',
      industry: 'Other Industry',
      activated: true,
      deleted: false,
      _surveys: {},
      _owner: ids.users.superAdminEditor,
      __v: 0
    },
    operatorToEdit1: {
      _id: ids.users.operatorToEdit1,
      username: 'oksana',
      password: 'q1w2e3r4',
      firstName: 'oksana',
      lastName: 'ToEdit',
      email: 'oksana@mailinator.com',
      phone: 2034291382,
      permission: 'operator',
      country: 'Other Country',
      company: 'Other Company',
      industry: 'Other Industry',
      activated: true,
      deleted: false,
      _surveys: {},
      _owner: ids.users.superAdminEditor,
      __v: 0
    },
    fieldWorkerToEdit1: {
      _id: ids.users.fieldWorkerToEdit1,
      username: 'fanya',
      password: 'q1w2e3r4',
      firstName: 'fanya',
      lastName: 'ToEdit',
      phone: 0234312984121,
      permission: 'fieldWorker',
      country: 'Other Country',
      company: 'Other Company',
      industry: 'Other Industry',
      activated: true,
      deleted: false,
      _surveys: {},
      _owner: ids.users.superAdminEditor,
      __v: 0
    },

    adminEditor: {
      _id: ids.users.adminEditor,
      username: 'Adminissa',
      password: 'q1w2e3r4',
      firstName: 'anna',
      lastName: 'killers',
      email: 'adminissa@mailinator.com',
      phone: 2929292199,
      permission: 'admin',
      country: 'Other Country',
      company: 'Other Company',
      industry: 'Other Industry',
      activated: true,
      deleted: false,
      _surveys: {},
      _owner: ids.users.superAdminEditor,
      __v: 0
    },
    adminToEdit2: {
      _id: ids.users.adminToEdit2,
      username: 'alina',
      password: 'q1w2e3r4',
      firstName: 'alina',
      lastName: 'ToEdit',
      email: 'alina@mailinator.com',
      phone: 2922192933,
      permission: 'admin',
      country: 'Other Country',
      company: 'Other Company',
      industry: 'Other Industry',
      activated: true,
      deleted: false,
      _surveys: {},
      _owner: ids.users.superAdminEditor,
      __v: 0
    },
    operatorToEdit2: {
      _id: ids.users.operatorToEdit2,
      username: 'olena',
      password: 'q1w2e3r4',
      firstName: 'olena',
      lastName: 'ToEdit',
      email: 'olena@mailinator.com',
      phone: 2034212823,
      permission: 'operator',
      country: 'Other Country',
      company: 'Other Company',
      industry: 'Other Industry',
      activated: true,
      deleted: false,
      _surveys: {},
      _owner: ids.users.superAdminEditor,
      __v: 0
    },
    fieldWorkerToEdit2: {
      _id: ids.users.fieldWorkerToEdit2,
      username: 'frank',
      password: 'q1w2e3r4',
      firstName: 'frank',
      lastName: 'ToEdit',
      phone: 02343229842,
      permission: 'fieldWorker',
      country: 'Other Country',
      company: 'Other Company',
      industry: 'Other Industry',
      activated: true,
      deleted: false,
      _surveys: {},
      _owner: ids.users.superAdminEditor,
      __v: 0
    }
  },
  Schema = require('../app/schemas/User');

for (var i in users) {
  if (!users.hasOwnProperty(i)) {
    continue;
  }
  var md5Hash = crypto.createHash('md5');

  users[i]._password = users[i].password;
  users[i].password = md5Hash.update(users[i].username + ':NDG:' + users[i].password).digest("hex");
  users[i].encrypted = true
}

exports.users = users;

var APIeasy = require('api-easy'),
  assert = require('assert'),
  userFixtures = require('../../../../fixtures/Users'),
  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),
  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,
  userSuite = fixturesLoader(APIeasy.describe('User Controller')),
  users = userFixtures.users,
  incrementVersion = require('../../../helpers/version').increment,
  _ = require('lodash')
;


var newSuperAdminUser = {
      username: 'Sansa',
      password: 'cTF3MmUzcjQ=',
      firstName: 'Sansa',
      lastName: 'Stark',
      email: 'sansa@mailinator.com',
      phone: '543216543654',
      permission: 'superAdmin',
      country: 'Super Country',
      company: 'Super Company',
      industry: 'Super Industry'
    },
    newAdminUser = {
      username: 'Aryasha',
      password: 'cTF3MmUzcjQ=',
      firstName: 'Arya',
      lastName: 'Stark',
      email: 'arya@mailinator.com',
      phone: '45679876545356',
      permission: 'admin'
    },
    newOperatorUser = {
      username: 'Olenjka',
      password: 'cTF3MmUzcjQ=',
      firstName: 'Olga',
      lastName: 'Vincent',
      email: 'olga@mailinator.com',
      phone: '23487612376843',
      permission: 'operator'
    },
    newFieldWorkerUser = {
      username: 'Fedja',
      password: 'cTF3MmUzcjQ=',
      firstName: 'Fedja',
      lastName: 'Vincent',
      phone: '234567874536768',
      permission: 'fieldWorker'
    },
    newAdminUser2 = {
      username: 'Anastasia',
      password: 'cTF3MmUzcjQ=',
      firstName: 'Anastasia',
      lastName: 'Stark',
      email: 'anastasia@mailinator.com',
      phone: '234657876343424',
      permission: 'admin'
    },
    newOperatorUser2 = {
      username: 'Onyfriy',
      password: 'cTF3MmUzcjQ=',
      firstName: 'Onyfriy',
      lastName: 'Vincent',
      email: 'onyfriy@mailinator.com',
      phone: '43354123433554',
      permission: 'operator'
    },
    newFieldWorkerUser2 = {
      username: 'Filip',
      password: 'cTF3MmUzcjQ=',
      firstName: 'Filip',
      lastName: 'Vincent',
      phone: '53474543325656',
      permission: 'fieldWorker'
    }
  ;

function changeField (obj , field, param){
  var user = _.clone(obj);
  user[field] = param;
  return user
};

function newUserData (obj){
  var user = _.clone(obj);
  user.username = 'new_' + user.username;
  user.password = 'new' + user.password;
  user.firstName = 'new_' + user.firstName;
  user.lastName = 'new_' + user.lastName;
  user.phone = '123' + user.phone;
  user.country = 'New' + user.country;
  user.company = 'New' + user.company;
  user.industry = 'New' + user.industry;
  if (user.permission !== 'fieldWorker' ) {
    user.email = 'new' + user.email;
  }
  return user
};

userSuite.login = function (user) {
  return loginHelper.login(this, user);
};

userSuite.logout = function () {
  return this
    .path('/logout')
      .get({})
        .expect(204)
    .unpath()
  ;
}

userSuite.checkFieldsValidation = function (userData) {
  this
    .discuss('with empty username')
      .post(changeField(userData, 'username', ''))
        .expect(400, [{ path: 'username', message: 'This field is required' }])
    .undiscuss()
    .next()
    .discuss('with existing username')
      .post(changeField(userData, 'username', users.admin.username))
        .expect(400, [{ path: 'username', message: 'This username is already used' }])
    .undiscuss()
    .next()
    .discuss('with empty password')
      .post(changeField(userData, 'password', ''))
        .expect(400, [{ path: 'password', message: 'This field is required' }])
    .undiscuss()
    .next()
    .discuss('with empty firstName')
      .post(changeField(userData, 'firstName', ''))
        .expect(400, [{ path: 'firstName', message: 'This field is required' }])
    .undiscuss()
    .next()
    .discuss('with empty lastName')
      .post(changeField(userData, 'lastName', ''))
        .expect(400, [{ path: 'lastName', message: 'This field is required' }])
    .undiscuss()
    .next()
    .discuss('with empty phone')
      .post(changeField(userData, 'phone', ''))
        .expect(400, [{ path: 'phone', message: 'This field is required' }])
    .undiscuss()
    .next()
    .discuss('with phone number')
      .post(changeField(userData, 'phone', 'wrong format'))
        .expect(400, [{ path: 'phone', message: 'Invalid field format' }])
    .undiscuss()
    .next();

    if (userData.permission == 'superAdmin') {
     this
       .next()
       .discuss('with empty industry')
         .post(changeField(userData, 'industry', ''))
           .expect(400, [{ path: 'industry', message: 'This field is required' }])
       .undiscuss()
       .next()
       .discuss('with empty company')
         .post(changeField(userData, 'company', ''))
           .expect(400, [{ path: 'company', message: 'This field is required' }])
       .undiscuss()
       .next()
       .discuss('with empty country')
         .post(changeField(userData, 'country', ''))
           .expect(400, [{ path: 'country', message: 'This field is required' }])
       .undiscuss()
       .next();
    }

    if (userData.permission !== 'fieldWorker'){
     this
       .discuss('with empty email')
         .post(changeField(userData, 'email', ''))
           .expect(400, [{ path: 'email', message: 'This field is required' }])
       .undiscuss()
       .next()
    }
  return this;
}

userSuite.checkUpdatedFields = function (userData) {
  return this
    .discuss('with existing username')
      .put('/' + userData._id, changeField(userData, 'username', users.admin.username))
        .expect(400, [{ path: 'username', message: 'This username is already used' }])
    .undiscuss()
    .next()
    .discuss('with invalid phone number')
      .put('/' + userData._id, changeField(userData, 'phone', 'wrong format'))
        .expect(400, [{ path: 'phone', message: 'Invalid field format' }])
    .undiscuss()
    .next()
  ;
}

userSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .path('/signup')
  .setHeader('Content-Type', 'application/json')
  .discuss('When user is registering in to our system')
    .checkFieldsValidation(newSuperAdminUser)
    .discuss('should return 204 status for right user')
      .post(newSuperAdminUser)
        .expect(204)
    .undiscuss()
  .undiscuss()
  .next()
  .unpath()
  .path('/users')
  .discuss('When unauthorized user tries to get users list')
    .get({})
      .expect(401)
  .undiscuss()
  .unpath()
  .next()

  .login('superAdmin')
  .next()
  .path('/users')
  .discuss('When superAdmin "'+ users.superAdmin.username + '"' )
    .discuss('tries to get users list')
      .get({})
        .expect(200)
        .expect('should respond with 4 users return', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.length, 4);
        })
    .undiscuss()
    .next()
    .discuss('creates new superAdmin user')
      .post(newSuperAdminUser)
        .expect(403)
    .undiscuss()
    .next()
    .discuss('creates new admin user')
      .checkFieldsValidation(newAdminUser)
      .discuss('with right fields')
        .post(newAdminUser)
          .expect(200)
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('creates new operator user')
      .checkFieldsValidation(newOperatorUser)
      .discuss('should return 200 status for right fields')
        .post(newOperatorUser)
          .expect(200)
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('creates new field worker user')
      .checkFieldsValidation(newFieldWorkerUser)
      .discuss('should return 200 status for right fields')
        .post(newFieldWorkerUser)
          .expect(200)
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('get admin info')
      .get('/' + users.admin._id)
        .expect(200)
        .expect('should respond with "' + users.admin.username + '"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.username, users.admin.username);
        })
    .undiscuss()
    .next()
    .discuss('get operator info')
      .get('/' + users.operator._id)
        .expect(200)
        .expect('should respond with "' + users.operator.username + '"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.username, users.operator.username);
        })
    .undiscuss()
    .next()
    .discuss('get fieldWorker info')
      .get('/' + users.fieldWorker._id)
        .expect(200)
        .expect('should respond with "' + users.fieldWorker.username + '"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.username, users.fieldWorker.username);
        })
    .undiscuss()
    .next()
  .undiscuss()
  .next()
  .unpath()
  .logout()
  .login('admin')
  .next()
  .path('/users/')
  .discuss('When admin "'+ users.admin.username + '"' )
    .discuss('tries to get users list')
      .get({})
        .expect(200)
        .expect('should respond with 7 users return', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.length, 7);
        })
    .undiscuss()
    .next()
    .discuss('creates new superAdmin user')
      .post(newSuperAdminUser)
        .expect(403)
    .undiscuss()
    .next()
    .discuss('creates new admin user')
      .checkFieldsValidation(newAdminUser2)
      .discuss('should return 200 status for right fields')
        .post(newAdminUser2)
          .expect(200)
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('creates new operator user')
      .checkFieldsValidation(newOperatorUser2)
    .undiscuss()
    .discuss('should return 200 status for right fields')
      .post(newOperatorUser2)
        .expect(200)
    .undiscuss()
    .next()
    .discuss('creates new field worker user')
      .checkFieldsValidation(newFieldWorkerUser2)
      .discuss('should return 200 status for right fields')
        .post(newFieldWorkerUser2)
          .expect(200)
      .undiscuss()
      .next()
    .undiscuss()
    .discuss('get user info with wrong Id')
      .get('/' + 'wrongId')
        .expect(500)
    .undiscuss()
    .discuss('get admin user info')
      .get('/' + users.admin._id)
        .expect(200)
        .expect('should respond with "' + users.admin.username + '"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.username, users.admin.username);
        })
    .undiscuss()
    .next()
    .discuss('get admin operator info')
      .get('/' + users.operator._id)
        .expect(200)
        .expect('should respond with "' + users.operator.username + '"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.username, users.operator.username);
        })
    .undiscuss()
    .next()
    .discuss('get admin fieldWorker info')
      .get('/' + users.fieldWorker._id)
        .expect(200)
        .expect('should respond with "' + users.fieldWorker.username + '"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.username, users.fieldWorker.username);
        })
    .undiscuss()
  .undiscuss()
  .next()
  .unpath()
  .logout()
  .login('superAdminEditor')
  .path('/users')
  .next()
  .discuss('When superAdmin "'+ users.superAdminEditor.username + '"' )
    .discuss('tries to get info of another superAdmin')
      .get('/' + users.superAdmin._id)
        .expect(400)
    .undiscuss()
    .next()
    .discuss('tries to update his own profile info')
      .checkUpdatedFields(newUserData(users.superAdminEditor))
      .discuss('with right fields')
        .put('/' + users.superAdminEditor._id, newUserData(users.superAdminEditor))
          .expect(200)
          .expect('should respond his id ', function (err, resp, body) {
            var id = JSON.parse(body).id.toString();
            assert.equal(id, users.superAdminEditor._id);
          })
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('tries to update admin profile info')
      .checkUpdatedFields(newUserData(users.adminToEdit1))
      .discuss('with right fields')
        .put('/' + users.adminToEdit1._id, newUserData(users.adminToEdit1))
          .expect(200)
          .expect('should respond admin id ', function (err, resp, body) {
            var id = JSON.parse(body).id.toString();
            assert.equal(id, users.adminToEdit1._id);
          })
      .undiscuss()
    .undiscuss()
    .discuss('tries to update operator profile info')
      .checkUpdatedFields(newUserData(users.operatorToEdit1))
      .discuss('with right fields')
        .put('/' + users.operatorToEdit1._id, newUserData(users.operatorToEdit1))
          .expect(200)
          .expect('should respond operator id ', function (err, resp, body) {
            var id = JSON.parse(body).id.toString();
            assert.equal(id, users.operatorToEdit1._id);
          })
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('tries to update fieldWorker profile info')
      .checkUpdatedFields(newUserData(users.fieldWorkerToEdit1))
      .discuss('with right fields')
        .put('/' + users.fieldWorkerToEdit1._id, newUserData(users.fieldWorkerToEdit1))
          .expect(200)
          .expect('should respond fieldWorker id ', function (err, resp, body) {
            var id = JSON.parse(body).id.toString();
            assert.equal(id, users.fieldWorkerToEdit1._id);
          })
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('tries to delete admin')
      .del('/' + users.adminToEdit1._id)
        .expect(204)
    .undiscuss()
    .next()
    .discuss('tries to delete operator')
        .del('/' + users.operatorToEdit1._id)
          .expect(204)
    .undiscuss()
    .next()
    .discuss('tries to delete fieldWorker')
      .del('/' + users.fieldWorkerToEdit1._id)
        .expect(204)
    .undiscuss()
  .undiscuss()
  .unpath()
  .logout()

  .login('adminEditor')
  .next()
  .path('/users')
  .discuss('When admin "'+ users.adminEditor.username + '"' )
    .discuss('tries to update his own profile info')
      .checkUpdatedFields(newUserData(users.adminEditor))
      .discuss('with right fields')
        .put('/' + users.adminEditor._id, newUserData(users.adminEditor))
        .expect(200)
        .expect('should respond his id ', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();
          assert.equal(id, users.adminEditor._id);
        })
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('tries to update other admin profile info')
      .checkUpdatedFields(newUserData(users.adminToEdit2))
      .discuss('with right fields')
        .put('/' + users.adminToEdit2._id, newUserData(users.adminToEdit2))
        .expect(200)
        .expect('should respond admin id ', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();
          assert.equal(id, users.adminToEdit2._id);
        })
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('tries to update operator profile info')
      .checkUpdatedFields(newUserData(users.operatorToEdit2))
      .discuss('with right fields')
        .put('/' + users.operatorToEdit2._id, newUserData(users.operatorToEdit2))
        .expect(200)
        .expect('should respond operator id ', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();
          assert.equal(id, users.operatorToEdit2._id);
        })
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('tries to update fieldWorker profile info')
      .checkUpdatedFields(newUserData(users.fieldWorkerToEdit2))
      .discuss('with right fields')
        .put('/' + users.fieldWorkerToEdit2._id, newUserData(users.fieldWorkerToEdit2))
        .expect(200)
        .expect('should respond fieldWorker id ', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();
          assert.equal(id, users.fieldWorkerToEdit2._id);
        })
      .undiscuss()
    .undiscuss()
    .next()
    .discuss('tries to delete admin')
      .del('/' + users.adminToEdit2._id)
        .expect(204)
    .undiscuss()
    .next()
    .discuss('tries to delete operator')
      .del('/' + users.operatorToEdit2._id)
        .expect(204)
    .undiscuss()
    .next()
    .discuss('tries to delete fieldWorker')
      .del('/' + users.fieldWorkerToEdit2._id)
        .expect(204)
    .undiscuss()
    .next()
    .unpath()
    .logout()
  .undiscuss()
;

userSuite.export(module);


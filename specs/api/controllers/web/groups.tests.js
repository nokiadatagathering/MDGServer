var
  APIeasy = require('api-easy'),
  _ = require('lodash'),
  assert = require('assert'),

  groupName1 = 'Group1',
  groupName2 = 'Group2',
  groupName3 = 'Group3',

  newGroupName1 = 'New Group from superAdmin',
  newGroupName2 = 'New Group from admin',
  newGroupName3 = 'New Group from operator',

  users = require('../../../../fixtures/Users').users,
  groupFixtures = require('../../../../fixtures/Groups'),
  groups = groupFixtures.groups,
  idType = require('mongoose').Types.ObjectId,

  groupsData = _.mapValues(groups, function (group) {
    return _.mapValues(group, function (value) {
      return (value instanceof idType) ? value.toString() : value;
    });
  }),

  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),
  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,
  incrementVersion = require('../../../helpers/version').increment,
  groupsSuite = fixturesLoader(APIeasy.describe('Groups Controller'));


function addUser(group, user) {
  if (group.users) {
    group.users.push(user._id);
    return incrementVersion(group);
  } else {
    group.users = [ user._id ];
    return group;
  }
}

groupsSuite.testAddingToGroup = function (code) {
  var suite = this;
  ['admin', 'operator', 'fieldWorker', 'superAdmin'].forEach(function (kind) {
    suite
      .discuss('adds ' + kind + ' user to group')
      .put('/' + groups.testGroup._id, addUser(groupsData.testGroup, users[kind]))
      .expect(code)
      .undiscuss()
      .next()
  });
  return suite;
};

groupsSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json');

loginHelper.login(groupsSuite, 'superAdmin')
  .next()
  .discuss('When superAdmin')
    .discuss('creates new group')
      .path('/groups')
      .post({name: newGroupName1})
        .expect(200)
    .undiscuss()
    .next()
    .testAddingToGroup(200)
    .discuss('tries to change group name')
      .put('/' + groups.testGroup._id, incrementVersion(_.extend(groupsData.testGroup, { name: groupName1 })))
        .expect(200)
    .undiscuss()
    .next()
    .discuss('tries to get all groups')
      .get()
        .expect(200)
        .expect('should respond with 5 groups return', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.length, 5);
        })
    .undiscuss()
    .next()
    .discuss('tries to get test group info')
      .get('/' + groups.testGroup._id)
        .expect(200)
        .expect('should respond with 4 users in groups return', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.users.length, 4);
        })
        .expect('should respond with "Group1"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.name, groupName1);
        })
    .undiscuss()
    .next()
    .discuss('tries to create group with existing name')
      .post({ name: newGroupName1 })
        .expect(400)
    .undiscuss()
    .next()
    .discuss('tries to update group with old version')
      .put('/' + groups.testGroup._id, groups.testGroup)
        .expect(409)
    .undiscuss()
    .next()
    .discuss('tries to delete group')
      .del('/' + groups.groupToDelete1._id)
        .expect(204)
    .undiscuss()
    .next()
    .discuss('tries to delete users from a group')
      .put('/' + groups.testGroup._id, incrementVersion(_.extend(groupsData.testGroup, { users: [] })))
        .expect(200)
    .undiscuss()
  .undiscuss()
  .unpath()
;

loginHelper.login(groupsSuite, 'admin')
  .next()
  .path('/groups')
  .discuss('When admin')
    .discuss('creates new group')
      .post({name: newGroupName2})
      .expect(200)
    .testAddingToGroup(200)
    .undiscuss()
    .next()
    .discuss('tries to change group name')
      .put('/' + groups.testGroup._id, incrementVersion(_.extend(groupsData.testGroup, { name: groupName2 })))
        .expect(200)
    .undiscuss()
    .next()
    .discuss('tries to get all groups')
      .get()
        .expect(200)
        .expect('should respond with 5 groups return', function (err, resp, body) {
           var result = JSON.parse(body);
           assert.equal(result.length, 5);
        })
    .undiscuss()
    .next()
    .discuss('tries to get test group info')
      .get('/' + groups.testGroup._id)
        .expect(200)
        .expect('should respond with 4 users in groups return', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.users.length, 4);
        })
        .expect('should respond with "groupName2"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.name, groupName2);
        })
    .undiscuss()
    .next()
    .discuss('tries to create group with existing name')
      .post({ name: groupName2 })
        .expect(400)
    .undiscuss()
    .next()
    .discuss('tries to update group with old version')
      .put('/' + groups.testGroup._id, groups.testGroup)
        .expect(409)
    .undiscuss()
    .next()
    .discuss('tries to delete group')
      .del('/' + groups.groupToDelete2._id)
        .expect(204)
    .undiscuss()
    .next()
    .discuss('tries to delete nonexistent group')
      .del('/' + groups.groupToDelete2._id)
        .expect(204)
    .undiscuss()
    .next()
    .discuss('tries to delete users from a group')
      .put('/' + groups.testGroup._id, incrementVersion(_.extend(groupsData.testGroup, { users: [] })))
        .expect(200)
    .undiscuss()
  .undiscuss()
  .unpath()
;

loginHelper.login(groupsSuite, 'operator')
  .next()
  .path('/groups')
  .discuss('When operator')
    .discuss('tries to create new group')
      .post({ name: newGroupName3 })
        .expect(403)
    .undiscuss()
    .next()
    .testAddingToGroup(403)
    .discuss('tries to change group name')
      .put('/' + groups.testGroup._id, incrementVersion(_.extend(groupsData.testGroup, { name: newGroupName3 })))
        .expect(403)
    .undiscuss()
    .next()
    .discuss('tries to get all groups')
      .get()
        .expect(200)
        .expect('should respond with 4 groups return', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.length, 4);
        })
    .undiscuss()
    .next()
    .discuss('tries to get test group info')
      .get('/' + groups.testGroup._id)
        .expect(200)
        .expect('should respond with 0 users in groups return', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.users.length, 0);
        })
        .expect('should respond with "groupName2"', function (err, resp, body) {
          var result = JSON.parse(body);
          assert.equal(result.name, groupName2);
        })
    .undiscuss()
    .next()
    .discuss('tries to create group with existing name')
      .post({ name: groupName2 })
        .expect(403)
    .undiscuss()
    .next()
    .discuss('tries to update group with old version')
      .put('/' + groups.testGroup._id, groups.testGroup)
        .expect(403)
    .undiscuss()
    .next()
    .discuss('tries to delete group')
      .del('/' + groups.groupToDelete3._id)
        .expect(403)
    .undiscuss()
    .next()
    .discuss('tries to delete users from a group')
      .put('/' + groups.testGroup._id, incrementVersion(_.extend(groupsData.testGroup, { users: [] })))
        .expect(403)
    .undiscuss()
  .undiscuss()
.unpath()
;

groupsSuite.export(module);


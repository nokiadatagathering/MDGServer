var
  APIeasy = require('api-easy'),
  _ = require('underscore'),
  assert = require('assert'),

  surveysFixtures = require('../../../../fixtures/Surveys'),
  surveys = surveysFixtures.surveys,
  users = require('../../../../fixtures/Users').users,
  surveyData = {},

  Configuration = require('../../../../app/helpers/Configuration'),
  loginHelper = require('../../../helpers/login'),

  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,
  incrementVersion = require('../../../helpers/version').increment,
  surveysSuite = fixturesLoader(APIeasy.describe('Survey Controller')),

  newSurveys = {
    superAdmin: {
      title: "New Survey from superAdmin",
      _categories:[{
        title: "First Category",
        id: 1,
        _questions: [{
          type: "string",
          required: false,
          label: "First question",
          tagName: "input",
          id: 1
        }]
      }]
    },
    admin: {
      title: "New Survey from admin",
      _categories:[{
        title: "First Category",
        id: 1,
        _questions: [{
          type: "string",
          required: true,
          label: "First question",
          tagName: "select1",
          items: ['option1', 'option2'],
          id: 1
        }]
      }]
    },
    operator: {
      title: "New Survey from operator",
      _categories:[{
        title: "First Category",
        id: 1,
        _questions: [{
          type: "string",
          required: true,
          label: "First question",
          tagName: "select",
          items: ['option1', 'option2', 'option3'],
          id: 1
        }]
      }]
    }
  };

function surveyTestsForUser (user) {
  loginHelper.login(surveysSuite, user)
    .next()
    .discuss('When ' + user)
      .path('/surveys')
      .discuss('creates new survey')
        .post(newSurveys[user])
        .expect(200)
        .expect('should respond with new survey id', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();

          assert.equal(id.length, 24);

          surveysSuite.before('setSurveyId', function (outgoing) {
            outgoing.uri = outgoing.uri.replace('SURVEY_ID', id);
            newSurveys[user]._id = id;

            return outgoing;
          });
        })
        .next()
        .get('/SURVEY_ID')
        .expect(200)
        .expect('should return this survey on show request with _id field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._id, newSurveys[user]._id);
        })
        .expect('should return this survey on show request with title field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.title, newSurveys[user].title);
        })
        .expect('should return this survey on show request with _owner field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._owner, users.superAdmin._id.toString());
        })
        .expect('should return this survey on show request with _creator field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._creator._id, users[user]._id.toString());
          assert.equal(survey._creator.firstName, users[user].firstName);
          assert.equal(survey._creator.lastName, users[user].lastName);
        })
        .expect('should return this survey on show request with _categories field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey._categories.length, newSurveys[user]._categories.length);
        })
        .expect('should return this survey on show request with published field', function (err, resp, body) {
          var survey = JSON.parse(body);

          assert.equal(survey.published, false);
        })
        .expect('should return this survey on show request with _v field', function (err, resp, body) {
          var survey = JSON.parse(body);

          surveyData = survey;

          assert.equal(survey.__v, 0);

          surveysSuite.before('setSurveyInfo', function (outgoing) {
            if (outgoing.body) {
              var updateInfo = JSON.parse(outgoing.body);

              surveyData[updateInfo.field] = updateInfo.value;
              outgoing.body = JSON.stringify(surveyData);

              incrementVersion(surveyData);
            }

            return outgoing;
          });
        })
        .next()
      .undiscuss()
      .discuss('updates survey title')
        .put('/SURVEY_ID', { field: 'title', value: 'My New Title' })
        .expect(200)
        .expect('should respond with survey id', function (err, resp, body) {
          var id = JSON.parse(body).id.toString();

          assert.equal(id, surveyData._id.toString());
        })
        .next()
        .get('/SURVEY_ID')
        .expect(200)
        .expect('should return this survey on show request with new title', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.equal(result.title, surveyData.title);
        })
        .next()
      .undiscuss()
      .discuss('add new category to survey')
        .put('/SURVEY_ID', {
          field: '_categories',
          value: [{
            title: "New Category",
            id: 2,
            _questions: []
          }]
        })
        .expect(200)
        .next()
        .get('/SURVEY_ID')
        .expect(200)
        .expect('should return this survey on show request with new category', function (err, resp, body) {
          var
            result = JSON.parse(body),
            surveyCat = surveyData._categories[surveyData._categories.length - 1],
            resultCat = result._categories[result._categories.length - 1];

          assert.equal(resultCat.title, surveyCat.title);
          assert.equal(resultCat.id, surveyCat.id);
          assert.deepEqual(resultCat._questions, surveyCat._questions);
        })
        .next()
      .undiscuss()
      .discuss('add new question to survey')
        .put('/SURVEY_ID',  {
          field: '_categories',
          value: [{
            title: "New Category",
            id: 2,
            _questions:  [{
              label: "New Question",
              id: 2,
              type: 'select',
              tagName: 'select',
              required: false,
              items: ['option1', 'option2', 'option3']
            }]
          }]
        })
        .expect(200)
        .next()
        .get('/SURVEY_ID')
        .expect(200)
        .expect('should return this survey on show request with new question', function (err, resp, body) {
          var
            result = JSON.parse(body),
            surveyQuest = surveyData._categories[0]._questions[surveyData._categories[0]._questions.length - 1],
            resultQuest = result._categories[0]._questions[result._categories[0]._questions.length - 1];

          assert.equal(resultQuest.label, surveyQuest.label);
          assert.equal(resultQuest.id, surveyQuest.id);
          assert.equal(resultQuest.type, surveyQuest.type);
          assert.equal(resultQuest.tagName, surveyQuest.tagName);
          assert.equal(resultQuest.required, surveyQuest.required);
          assert.deepEqual(resultQuest.items, surveyQuest.items);
        })
        .next()
      .undiscuss()
      .discuss('tries to get surveys list')
        .get()
        .expect(200)
        .expect('should return new survey in the list', function (err, resp, body) {
          var
            result = JSON.parse(body);

          result = _.find(result, function (result) {
            return result._id == newSurveys[user]._id.toString();
          })

          assert.equal(result._id, newSurveys[user]._id.toString());
        })
        .next()
        .undiscuss()
      .discuss('tries to delete unpublished survey')
        .del('/SURVEY_ID')
        .expect(204)
        .next()
        .discuss('and requests this survey')
          .get('/SURVEY_ID')
          .expect(400)
          .expect('should return error message', function (err, resp, body) {
            var result = JSON.parse(body)[0];

            assert.deepEqual(result, { path: 'survey', message: 'Unknown entity' });
          })
        .undiscuss()
        .next()
      .undiscuss()
      .discuss('tries to delete published survey')
        .del('/' + surveys.publishedSurvey._id)
        .expect(400)
        .expect('should return error message', function (err, resp, body) {
          var result = JSON.parse(body)[0];

          assert.deepEqual(result, { path: 'published', message: 'Can not edit the published survey' });
        })
      .next()
      .undiscuss()
      .discuss('tries to get unpublished survey')
        .get('/' + surveys.unpublishedSurvey._id)
        .expect(200)
        .expect('should respond with survey info', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.equal(result._id, surveys.unpublishedSurvey._id);
          assert.equal(result.published, surveys.unpublishedSurvey.published);
        })
        .next()
      .undiscuss()
      .discuss('tries to get published survey')
        .get('/' + surveys.publishedSurvey._id)
        .expect(200)
        .expect('should respond with survey info', function (err, resp, body) {
          var result = JSON.parse(body);

          assert.equal(result._id.toString(), surveys.publishedSurvey._id.toString());
          assert.equal(result.published, surveys.publishedSurvey.published);

          surveysSuite.unbefore('setSurveyInfo');
          surveysSuite.unbefore('setSurveyId');
        })
        .next()
      .undiscuss()
    .undiscuss()
  .unpath()
}

surveysSuite
  .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
  .setHeader('Content-Type', 'application/json')
  .discuss('When unauthorized user')
    .path('/surveys')
    .discuss('tries to get surveys list')
      .get()
      .expect(401)
      .undiscuss()
      .next()
    .discuss('tries to get survey info')
      .get('/' + surveys.publishedSurvey)
      .expect(401)
      .undiscuss()
      .next()
    .discuss('tries to create new survey')
      .post({})
      .expect(401)
      .undiscuss()
      .next()
    .discuss('tries to update survey info')
      .put('/' + surveys.publishedSurvey, {})
      .expect(401)
      .undiscuss()
      .next()
    .discuss('tries to delete survey info')
      .del('/' + surveys.publishedSurvey)
      .expect(401)
      .undiscuss()
      .next()
    .undiscuss()
    .unpath()

surveyTestsForUser('superAdmin');
surveyTestsForUser('admin');
surveyTestsForUser('operator');

surveysSuite.export(module);

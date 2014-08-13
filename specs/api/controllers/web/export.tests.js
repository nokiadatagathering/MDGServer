var
  APIeasy = require('api-easy'),
  assert = require('assert'),

  results = require('../../../../fixtures/Results').results,
  surveys = require('../../../../fixtures/Surveys').surveys,

  loginHelper = require('../../../helpers/login'),
  Configuration = require('../../../../app/helpers/Configuration'),

  resultsIds = [results.result3._id, results.result4._id, results.result5._id],
  resultsIdWithImages = [results.result1._id, results.result2._id],

  fixturesLoader = require('../../../helpers/fixturesLoader').addToSuite,

  exportSuite = fixturesLoader(APIeasy.describe('Export Controller'));

function exportTestsForUser (user) {
  loginHelper.login(exportSuite, user)
    .next()
    .discuss('When ' + user)
      .path('/export/' + surveys.testSurvey._id)
      .discuss('tries to export survey results without images in csv format')
        .post('?type=csv', { results: resultsIds })
        .expect(200)
        .expect('should return csv file in response', function (err, resp, body) {
          assert.equal(resp.headers['content-type'], 'text/csv');
        })
        .next()
      .undiscuss()
      .discuss('tries to export survey results without images in xls format')
        .post('?type=xls', { results: resultsIds })
        .expect(200)
        .expect('should return xls file in response', function (err, resp, body) {
          assert.equal(resp.headers['content-type'], 'application/vnd.ms-excel');
        })
        .next()
      .undiscuss()
      .discuss('tries to export survey results in kml format')
        .post('?type=kml', { results: resultsIdWithImages })
        .expect(200)
        .expect('should return kml file in response', function (err, resp, body) {
          assert.equal(resp.headers['content-type'], 'text/xml');
        })
        .next()
      .undiscuss()
      .discuss('tries to export survey results with images in csv format')
        .post('?type=csv', { results: resultsIdWithImages })
        .expect(200)
        .expect('should return zip archive in response', function (err, resp, body) {
          assert.equal(resp.headers['content-type'], 'application/octet-stream');
        })
        .next()
      .undiscuss()
      .discuss('tries to export survey results with images in xls format')
        .post('?type=xls', { results: resultsIdWithImages })
        .expect(200)
        .expect('should return zip archive in response', function (err, resp, body) {
          assert.equal(resp.headers['content-type'], 'application/octet-stream');
        })
        .next()
      .undiscuss()
      .unpath()
      .discuss('tries to export survey results invalid survey id')
        .post('/export/' + surveys.surveyFromOtherCommunity._id, { results: resultsIds })
        .expect(400)
        .expect('should return error message', function (err, resp, body) {
          var result = JSON.parse(body)[0];

          assert.deepEqual(result, { path: 'survey', message: 'Unknown entity' });
        })
        .next()
      .undiscuss()
    .undiscuss()
}


  exportSuite
    .use(Configuration.get('tests.host'), Configuration.get('tests.port'))
    .setHeader('Content-Type', 'application/json')
    .discuss('When unauthorized user')
    .discuss('tries to export survey results')
    .post('/export/' + surveys.testSurvey._id, { results: resultsIds })
    .expect(401)
    .next()
    .undiscuss()
    .undiscuss()

  exportTestsForUser('superAdmin');
  exportTestsForUser('admin');
  exportTestsForUser('operator');

  exportSuite.export(module);

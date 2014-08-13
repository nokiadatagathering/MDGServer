var id = require('mongoose').Types.ObjectId;

module.exports = {
  users: {
    superAdmin: new id('52b330c7c3d1c6ed3306bf30'),
    admin: new id('52b330c7c3d1c6ed3306bf31'),
    operator: new id('52b330c7c3d1c6ed3306bf32'),
    fieldWorker: new id('52b330c7c3d1c6ed3306bf33'),
    userToActivated: new id('52b330c7c3d1c6ed3306bf34'),
    superAdminEditor: new id('52b330c7c3d1c6ed3306bf35'),
    adminToEdit1: new id('52b330c7c3d1c6ed3306bf36'),
    operatorToEdit1: new id('52b330c7c3d1c6ed3306bf37'),
    fieldWorkerToEdit1: new id('52b330c7c3d1c6ed3306bf38'),
    adminEditor: new id('52b330c7c3d1c6ed3306bf39'),
    adminToEdit2: new id('52b330c7c3d1c6ed3306bf3a'),
    operatorToEdit2: new id('52b330c7c3d1c6ed3306bf3b'),
    fieldWorkerToEdit2: new id('52b330c7c3d1c6ed3306bf3c')
  },
  groups: {
    testGroup: new id('52b32fbb61e7c86c3381d740'),
    groupToDelete1: new id('52b32fbb61e7c86c3381d741'),
    groupToDelete2: new id('52b32fbb61e7c86c3381d742'),
    groupToDelete3: new id('52b32fbb61e7c86c3381d743')
  },
  surveys: {
    publishedSurvey: new id('52d3c4a78705399413000000'),
    unpublishedSurvey: new id('52d3c4a78705399413000001'),
    testSurvey: new id('52d3c4a78705399413000002'),
    surveyFromOtherCommunity: new id('52d3c4a78705399413000003'),
    surveyToSend_superAdmin: new id('52d3c4a78705399413000004'),
    surveyToSend_admin: new id('52d3c4a78705399413000005'),
    surveyToSend_operator: new id('52d3c4a78705399413000006')
  },
  results: {
    result1: new id('52fcfd1f11f7acc70d000090'),
    result2: new id('52fcfd1f11f7acc70d000091'),
    result3: new id('52fcfd1f11f7acc70d000092'),
    result4: new id('52fcfd1f11f7acc70d000093'),
    result5: new id('52fcfd1f11f7acc70d000094'),
    resultFromOtherCommunity: new id('52fcfd1f11f7acc70d000095')
  }
};
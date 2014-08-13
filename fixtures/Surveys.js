var
  ids = require('./ids'),
  surveys = {
    publishedSurvey: {
      _id: ids.surveys.publishedSurvey,
      title: "Published Survey",
      _owner: ids.users.superAdmin,
      _creator: ids.users.admin,
      published: true,
      archive: false,
      __v: 0,
      _categories:[{
        title: "First Category",
        id: "category1",
        _questions: [ ]
      }]
    },
    unpublishedSurvey: {
      _id: ids.surveys.unpublishedSurvey,
      title: "Unpublished Survey",
      _owner: ids.users.superAdmin,
      _creator: ids.users.operator,
      published: false,
      archive: false,
      __v: 0,
      _categories:[{
        title: "First Category",
        id: "category1",
        _questions: [ ]
      }]
    },
    surveyToSend_superAdmin: {
      _id: ids.surveys.surveyToSend_superAdmin,
      title: "Unpublished Survey",
      _owner: ids.users.superAdmin,
      _creator: ids.users.operator,
      published: false,
      archive: false,
      __v: 0,
      _categories:[{
        title: "First Category",
        id: "category1",
        _questions: [ ]
      }]
    },
    surveyToSend_admin: {
      _id: ids.surveys.surveyToSend_admin,
      title: "Unpublished Survey",
      _owner: ids.users.superAdmin,
      _creator: ids.users.operator,
      published: false,
      archive: false,
      __v: 0,
      _categories:[{
        title: "First Category",
        id: "category1",
        _questions: [ ]
      }]
    },
    surveyToSend_operator: {
      _id: ids.surveys.surveyToSend_operator,
      title: "Unpublished Survey",
      _owner: ids.users.superAdmin,
      _creator: ids.users.operator,
      published: false,
      archive: false,
      __v: 0,
      _categories:[{
        title: "First Category",
        id: "category1",
        _questions: [ ]
      }]
    },
    surveyFromOtherCommunity: {
      _id: ids.surveys.surveyFromOtherCommunity,
      title: "Survey From Other Community",
      _owner: ids.users.superAdminEditor,
      _creator: ids.users.superAdminEditor,
      published: false,
      archive: false,
      __v: 0,
      _categories:[{
        title: "First Category",
        id: "category1",
        _questions: [ ]
      }]
    },
    testSurvey: {
      "title": "Megasurvey",
      "_owner": ids.users.superAdmin,
      "_creator": ids.users.superAdmin,
      "_id": ids.surveys.testSurvey,
      "resultsCount": 5,
      "_categories": [
        {
          "title": "All types of questions",
          "id": "category9790",
          "_questions": [
            {
              "type": "string",
              "required": true,
              "constraint": "string-length( . ) <=30",
              "label": "What is your name?",
              "tagName": "input",
              "id": "question6345"
            },
            {
              "type": "int",
              "required": true,
              "constraint": "(. >= 1 and . <= 150)",
              "label": "How old are you?",
              "tagName": "input",
              "id": "question6352"
            },
            {
              "type": "decimal",
              "required": false,
              "constraint": "(. >= 20 and . <= 500)",
              "label": "What is your weight?",
              "tagName": "input",
              "id": "question9914"
            },
            {
              "type": "date",
              "required": true,
              "constraint": "(. >= 2004-01-01 and . <= 2014-01-31)",
              "relevant": "/data/category9790/question6352='(. >= 20 and . <= 50)'",
              "label": "When was the las time you were abroad?",
              "tagName": "input",
              "id": "question2670"
            },
            {
              "type": "geopoint",
              "required": true,
              "constraint": "",
              "label": "Need more location.",
              "tagName": "input",
              "id": "question8859"
            },
            {
              "type": "binary",
              "required": true,
              "constraint": "",
              "label": "Need more image.",
              "tagName": "upload",
              "mediatype": "image/*",
              "id": "question2140"
            },
            {
              "type": "select1",
              "required": false,
              "constraint": "",
              "label": "Are you crab?",
              "tagName": "select1",
              "id": "question7535",
              "items": [
                {
                  "text": "Yes!",
                  "value": "yes"
                },
                {
                  "text": "Wat?",
                  "value": "wat"
                },
                {
                  "text": "NO!",
                  "value": "no"
                },
                {
                  "text": "Wow-wow-wow",
                  "value": "wowwowwow"
                },
                {
                  "text": "Yep",
                  "value": "yep"
                }
              ]
            },
            {
              "type": "select",
              "required": false,
              "constraint": "",
              "label": "Look at my horse,",
              "tagName": "select",
              "id": "question3233",
              "items": [
                {
                  "text": "My horse is amazing!",
                  "value": "myhorseisamazing"
                },
                {
                  "text": "Give it a lick.",
                  "value": "giveitalick"
                },
                {
                  "text":"Hmm, It tastes just like raisins!",
                  "value":"hmmittastesjustlikeraisins"
                }
              ]
            }
          ]
        },
        {
          "title": "Skip Logic, baby!",
          "id": "category6282",
          "_questions": [
            {
              "type": "select1",
              "required": true,
              "constraint": "",
              "label": "Skip logic within one category",
              "tagName": "select1",
              "id": "question6849",
              "items": [
                {
                  "text": "go to Q1",
                  "value": "gotoq1"
                },
                {
                  "text": "go to Q2",
                  "value": "gotoq2"
                }
              ]
            },
            {
              "type": "string",
              "required": false,
              "constraint": "",
              "relevant": "/data/category6282/question6849='gotoq1'",
              "label": "Q1",
              "tagName": "input",
              "id": "question3658"
            },
            {
              "type": "string",
              "required": false,
              "constraint": "",
              "relevant": "/data/category6282/question6849='gotoq2'",
              "label": "Q2",
              "tagName": "input",
              "id": "question553"
            },
            {
              "type": "select1",
              "required": true,
              "constraint": "",
              "label": "Skip logic to the other category",
              "tagName": "select1",
              "id": "question5406",
              "items": [
                {
                  "text": "Q3",
                  "value": "q3"
                },
                {
                  "text": "Q4",
                  "value": "q4"
                }
              ]
            }
          ]
        },
        {
          "title": "Other category",
          "id": "category7315",
          "_questions": [
            {
              "type": "string",
              "required": false,
              "constraint": "",
              "relevant": "/data/category6282/question5406='q3'",
              "label": "Q3",
              "tagName": "input",
              "id": "question2574"
            },
            {
              "type": "string",
              "required": false,
              "constraint": "",
              "relevant": "/data/category6282/question5406='q4'",
              "label": "Q4",
              "tagName": "input",
              "id":"question9808"
            },
            {
              "type" : "cascade1",
              "required" : false,
              "constraint" : "",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question10",
              "items" : [
                {
                  "text" : "Zone 1",
                  "value" : "zone1"
                },
                {
                  "text" : "Zone 2",
                  "value" : "zone2"
                },
                {
                  "text" : "Zone 3",
                  "value" : "zone3"
                }
              ]
            },
            {
              "type" : "cascade2",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question10='zone1'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question11",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "County 1",
                  "value" : "county1"
                },
                {
                  "text" : "County 2",
                  "value" : "county2"
                }
              ]
            },
            {
              "type" : "cascade2",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question10='zone2'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question12",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "County 3",
                  "value" : "county3"
                },
                {
                  "text" : "County 4",
                  "value" : "county4"
                }
              ]
            },
            {
              "type" : "cascade2",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question10='zone3'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question13",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "County 5",
                  "value" : "county5"
                },
                {
                  "text" : "County 6",
                  "value" : "county6"
                }
              ]
            },
            {
              "type" : "cascade3",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question11='county1'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question14",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "District 1",
                  "value" : "district1"
                },
                {
                  "text" : "District 2",
                  "value" : "district2"
                }
              ]
            },
            {
              "type" : "cascade3",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question11='county2'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question15",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "District 3",
                  "value" : "district3"
                },
                {
                  "text" : "District 4",
                  "value" : "district4"
                }
              ]
            },
            {
              "type" : "cascade3",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question12='county3'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question16",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "District 5",
                  "value" : "district5"
                },
                {
                  "text" : "District 6",
                  "value" : "district6"
                }
              ]
            },
            {
              "type" : "cascade3",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question12='county4'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question17",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "District 7",
                  "value" : "district7"
                },
                {
                  "text" : "District 8",
                  "value" : "district8"
                }
              ]
            },
            {
              "type" : "cascade3",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question13='county5'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question18",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "District 9",
                  "value" : "district9"
                },
                {
                  "text" : "District 10",
                  "value" : "district10"
                }
              ]
            },
            {
              "type" : "cascade3",
              "required" : false,
              "constraint" : "",
              "relevant" : "/data/category7315/question13='county6'",
              "label" : "Choose your district",
              "tagName" : "select1",
              "id" : "question19",
              "parentid" : "question10",
              "items" : [
                {
                  "text" : "District 11",
                  "value" : "district11"
                },
                {
                  "text" : "District 12",
                  "value" : "district12"
                }
              ]
            }
          ]
        }
      ],
      "published": true,
      archive: false,
      "__v": 0
    }
  };

exports.surveys = surveys;

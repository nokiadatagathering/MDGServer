/* null means use default from configurationSchema.js */
module.exports = {
  general: {
    siteName: 'Microsoft Data Gathering',
    protocolType: 'http',
    port: 3001,
    mongodbUrl: 'mongodb://127.0.0.1:27017/MDG-test'
  },
  basicAuth: {
    password: null,
    username: null
  },
  twilio: {
    accountSid: null,
    authToken: null,
    phoneNumber: null
  },
  mail: {
    from: {
      registration: 'mdgspprt@microsoft.com',
      subscription: 'noreply@nokiadatagathering.net',
      report: 'report@nokiadatagathering.net'
    },
    emailsForUsersReport: null,
    emailsForUsersReport: []
  }
};

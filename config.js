/* null means use default from configurationSchema.js */
module.exports = {
  general: {
    siteName: 'Microsoft Data Gathering',
    protocolType: 'http',
    port: 3000,
    mongodbUrl: null
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
      registration: 'registration@nokiadatagathering.net',
      subscription: 'noreply@nokiadatagathering.net',
      report: 'report@nokiadatagathering.net'
    },
    transport: 'Direct',
    emailsForUsersReport: []
  }
};

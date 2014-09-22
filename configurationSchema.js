module.exports = {
  general: {
    title: 'General',
    description: '',
    children: {
      siteName: {
        type: String,
        title: 'Site Name',
        description: '',
        defaults: 'NOKIA DATA GATHERING'
      },
      protocolType: {
        type: String,
        title: 'Protocol',
        description: 'This parameter can be set to http or https',
        defaults: 'http'
      },
      httpspfx: {
        type: String,
        title: 'https pfx',
        description: 'Path to .pfx file',
        defaults: './ndg.pfx'
      },
      httpspassphrase: {
        type: String,
        title: 'https password phrase',
        description: 'Password required by certificate',
        defaults: 'q1w2e3r4'
      },
      port: {
        type: String,
        title: 'Port',
        description: '',
        defaults: 3000
      },
      mongodbUrl: {
        type: String,
        title: 'Mongo DB Url',
        description: '',
        defaults: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/MDG'
      },
      questionsTypes: {
        type: Object,
        title: 'Available questions types',
        description: 'Types of questions that can be used',
        defaults: ['string', 'int', 'decimal', 'date', 'geopoint', 'binary', 'binary#image', 'select', 'select1', 'time', 'note']
      }
    }
  },
  digestAuth: {
    title: 'Digest Auth',
    description: 'Parameters for Digest Authorization. Do NOT change these unless you know what you are doing',
    children: {
      qop: {
        type: String,
        title: 'qop',
        defaults: 'auth'
      },
      realm: {
        type: String,
        title: 'realm',
        defaults: 'NDG'
      },
      algorithm: {
        type: String,
        title: 'algorithm',
        defaults: 'MD5'
      },
      opaque: {
        type: String,
        title: 'opaque',
        defaults: 'bmRnb3BhcXVl'
      }
    }
  },
  basicAuth: {
    title: 'Basic Auth',
    description: 'Parameters for Basic Authorization.',
    children: {
      username: {
        type: String,
        title: 'username',
        defaults: 'admin'
      },
      password: {
        type: String,
        title: 'password',
        defaults: 'admin'
      }
    }
  },
  tests: {
    title: 'Tests',
    description: '',
    children: {
      host: {
        type: String,
        title: 'Host',
        description: 'Host (ip) to bind for tests',
        defaults: 'localhost'
      },
      port: {
        type: String,
        title: 'Port',
        description: 'Port on which testing server will run',
        defaults: 4000
      },
      mongodbUrl: {
        type: String,
        title: 'MongoDB Url',
        description: '',
        defaults: process.env.MONGO_TEST_URL || 'mongodb://127.0.0.1:27017/MDG-test'
      }
    }
  },
  twilio: {
    title: 'Twilio',
    description: 'Set of parameters used for Twilio configuration',
    children: {
      accountSid: {
        type: String,
        title: 'Twilio Account Sid',
        description: 'Unique ID of the Account - first credential to determine which account an API request is coming from (acts as username)',
        defaults: ''
      },
      authToken: {
        type: String,
        title: 'Twilio Auth Token',
        description: 'Auth Token - second credential which acts as a password',
        defaults: ''
      },
      phoneNumber: {
        type: String,
        title: 'Twilio Phone Number',
        description: 'Phone number provided by Twilio',
        defaults: ''
      }
    }
  },
  messages: {
    title: 'Messages',
    description: '',
    children: {
      registrationSms: {
        type: String,
        title: 'User Register Sms',
        description: '',
        defaults: 'Hello, your credentials for MDG are: username %s, password %s.'
      },
      userUpdateSms: {
        type: String,
        title: 'User Register Sms',
        description: '',
        defaults: 'Hello, your credentials for MDG have been changed to: username %s, password %s.'
      },
      headerSms: {
        type: String,
        title: 'User Register Sms',
        description: '',
        defaults: 'MDG: '
      }
    }
  },
  mail: {
    title: 'Mail',
    description: 'Set of parameters related to mail configuration',
    children: {
      from: {
        title: 'Mail from',
        description: 'Defines e-mail for system messages',
        children: {
          registration: {
            type: String,
            title: 'Registration Email from',
            description: '',
            defaults: 'registration@nokiadatagathering.net'
          },
          subscription: {
            type: String,
            title: 'Subscription Email from',
            description: '',
            defaults: 'noreply@nokiadatagathering.net'
          },
          report: {
            type: String,
            title: 'Subscription Email from',
            description: '',
            defaults: 'report@nokiadatagathering.net'
          },
          forgotUsername: {
            type: String,
            title: 'Forgot Username Email from',
            description: '',
            defaults: 'reset_password@nokiadatagathering.net'
          },
          resetPassword: {
            type: String,
            title: 'Reset Password Email from',
            description: '',
            defaults: 'reset_password@nokiadatagathering.net'
          },
          passwordChanged: {
            type: String,
            title: 'Password Changed Email from',
            description: '',
            defaults: 'reset_password@nokiadatagathering.net'
          }
        }
      },
      transport: {
        type: String,
        title: 'Mail transport',
        description: 'Defines mail transport protocol',
        defaults: 'Direct'
      },
      transportOptions: {
        title: 'Mail transport Options',
        description: 'Defines method for sending e-mails',
        children: {
          service: {
            type: String,
            title: 'Service',
            description: 'The name of send mail service',
            defaults: 'Sendmail'
          }
        }
      },
      emailsForUsersReport: {
        type: Object,
        title: 'Emails for users registrations report',
        defaults: []
      },
      registration: {
        type: String,
        title: 'Registration Email',
        defaults: '/app/views/registrationEmail.jade'
      },
      subscription: {
        type: String,
        title: 'Subscription Email',
        defaults: '/app/views/subscriptionEmail.jade'
      },
      report: {
        type: String,
        title: 'Registration Email',
        defaults: '/app/views/reportEmail.jade'
      },
      forgotUsername: {
        type: String,
        title: 'Forgot Username Email',
        defaults: '/app/views/forgotUsernameEmail.jade'
      },
      resetPassword: {
        type: String,
        title: 'Reset Password Email',
        defaults: '/app/views/resetPasswordEmail.jade'
      },
      passwordChanged: {
        type: String,
        title: 'Password Changed Email',
        defaults: '/app/views/passwordChangedEmail.jade'
      }
    }
  }
};

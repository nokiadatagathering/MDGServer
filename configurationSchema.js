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
      },
      countries: {
        type: Object,
        title: 'Available countries',
        description: 'Available countries that can be used in registration form',
        defaults: ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Antarctic Territory", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Canton and Enderbury Islands", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos [Keeling] Islands", "Colombia", "Comoros", "Congo - Brazzaville", "Congo - Kinshasa", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Côte d’Ivoire", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Dronning Maud Land", "East Germany", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "French Southern and Antarctic Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Honduras", "Hong Kong SAR China", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Johnston Island", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau SAR China", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Metropolitan France", "Mexico", "Micronesia", "Midway Islands", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar [Burma]", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "Neutral Zone", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "North Vietnam", "Northern Mariana Islands", "Norway", "Oman", "Pacific Islands Trust Territory", "Pakistan", "Palau", "Palestinian Territories", "Panama", "Panama Canal Zone", "Papua New Guinea", "Paraguay", "People's Democratic Republic of Yemen", "Peru", "Philippines", "Pitcairn Islands", "Poland", "Portugal", "Puerto Rico", "Qatar", "Romania", "Russia", "Rwanda", "Réunion", "Saint Barthélemy", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syria", "São Tomé and Príncipe", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "U.S. Minor Outlying Islands", "U.S. Miscellaneous Pacific Islands", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Unknown or Invalid Region", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wake Island", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe", "Åland Islands"]
      }
    }
  },
  languages: {
    title: 'Languages',
    description: 'Parameters for Digest Authorization. Do NOT change these unless you know what you are doing',
    children: {
      preferred: {
        type: String,
        title: 'preferred language',
        description: '',
        defaults: 'en'
      },
      supported_languages: {
        type: Object,
        title: 'Supported languages',
        description: '',
        defaults: [{ value: 'en', text: 'English' }, { value: 'ru', text: 'Русский' }]
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
      mandrillApiKey: {
        type: String,
        title: 'Mandrill Api Key',
        description: 'Defines Mandrill Api Key',
        defaults: ''
      },
      emailsForUsersReport: {
        type: Object,
        title: 'Emails for users registrations report',
        defaults: []
      },
      registration: {
        type: String,
        title: 'Registration Email',
        defaults: '/app/views/emails/${languages.preferred}/registrationEmail.jade'
      },
      subscription: {
        type: String,
        title: 'Subscription Email',
        defaults: '/app/views/emails/${languages.preferred}/subscriptionEmail.jade'
      },
      report: {
        type: String,
        title: 'Registration Email',
        defaults: '/app/views/emails/reportEmail.jade'
      },
      forgotUsername: {
        type: String,
        title: 'Forgot Username Email',
        defaults: '/app/views/emails/${languages.preferred}/forgotUsernameEmail.jade'
      },
      resetPassword: {
        type: String,
        title: 'Reset Password Email',
        defaults: '/app/views/emails/${languages.preferred}/resetPasswordEmail.jade'
      },
      passwordChanged: {
        type: String,
        title: 'Password Changed Email',
        defaults: '/app/views/emails/${languages.preferred}/passwordChangedEmail.jade'
      }
    }
  }
};

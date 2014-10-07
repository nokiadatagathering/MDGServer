var errors = {
  required: 'This field cannot be blank.',
  minlength: 'This field must have at least $ characters.',
  maxlength: 'This field cannot be longer than $ characters.',
  uniqueUsername: 'This username is already used.',
  usernamePattern: 'Login can contain only numbers, periods and Latin letters.',
  confirmPassword: 'Passwords do not match'
};

$(function () {
  var hash = location.hash;
  $("div.content").hide();

  if (hash === '#login' || hash === '#register' || hash === '#forgotPassword') {
    $('[name=' + hash.split('#')[1]).addClass('active');
    $('div.content.' + hash.split('#')[1]).show();
  } else {
    location.hash = '';
    $('div.content.home').show();
  }

  $("#company").autocomplete({
    source: "/autocomplete/company",
    minLength: 1
  });

  $("#industry").autocomplete({
    source: "/autocomplete/industry",
    minLength: 1
  });
});

function chooseTab (el) {
  var name = el.name;

  $('div.header a.active').removeClass('active');
  $('div.header a[name=' + name + ']').addClass('active');

  $('div.content').hide();
  $('div.content.' + name).show();

  if (name === 'forgotPassword') {
    $(".forgotPassword .first").show();
    $(".forgotPassword .second").hide();
  }
}

function changeLanguage (el) {
  var lang = $(el).attr('value');
  document.cookie = 'NG_TRANSLATE_LANG_KEY=%22' + lang + '%22';
  location.reload();
}

function toggleDropdown (el) {
  $(el).children().toggleClass('open');
}

function showErrorMsgOnLoginForm (errorName, msg) {
  if (msg) {
    $('.login .errorsblock span.' + errorName)[0].innerText = msg;
  }

  $('.login .errorsblock span.' + errorName).show();
}

function hideErrorOnLoginForm () {
  $('.errorsblock span.login').hide();
}

function login () {
  var
    username = $(".login-form #username")[0].value.trim(),
    password = window.btoa($(".login-form #password")[0].value.trim());

  if ($('.login .errorsblock span.error-message:not([style="display: none;"])').length === 0) {
    $.post('login', { username: username, password: password })
      .done(function () {
        window.document.location.href = '/#/surveys';
      })
      .fail(function (data) {
        if (data.status === 401) {
          showErrorMsgOnLoginForm('login', data.responseJSON.message);
        }
      });
  }
}

function checkUniqueUsername () {
  var
    username = $(".register #username")[0].value.trim(),
    usernameRegexp = new RegExp('^[a-zA-Z\\d\\.]*$');

  if (usernameRegexp.test(username)) {
    $.post('validate/undefined', { field: 'username', value: username })
      .done(function (data) {
      })
      .fail(function (data) {
        showErrorMsg('username', 'uniqueUsername');
      });
  } else {
    showErrorMsg('username', 'usernamePattern');
  }
}

function checkPhone (el) {
  var
    phone = $(".register #phone")[0].value.trim(),
    phoneRegexp = new RegExp('^[0-9]*$'),
    replaceRegexp = new RegExp('[^0-9]', 'g');

  hideError(el);

  if (!phoneRegexp.test(phone)) {
    $(".register #phone")[0].value = phone.replace(replaceRegexp, '');
  }
}

function hideError (elem) {
  var field = elem.id;
  $('.errorsblock span.' + field).hide();
}

function showErrorMsg (field, type, param) {
  var errorMsg = errors[type];

  if (param) {
    errorMsg = errorMsg.replace('$', param);
  }

  $('.errorsblock span.' + field).each(function (el) {
    this.innerText = errorMsg;
  });

  $('.errorsblock span.' + field).show();
}

function validateData (user) {
  var
    length = {
      username: { min: 5, max: 13 },
      password: { min: 8, max: 20 },
      firstName: { min: 2, max: 60 },
      lastName: { min: 2, max: 60 },
      phone: { min: 10, max: 15 },
      email: { min: 3, max: 60 },
      company: { min: 3, max: 60 },
      industry: { min: 2, max: 60 }
    };

  for (var field in user) {
    if (!user[field]) {
      showErrorMsg(field, 'required');
      continue;
    }

    if (field == 'confirmpass' && user.confirmpass !== user.password) {
      showErrorMsg(field, 'confirmPassword');
      continue;
    }

    if (field == 'country' && user[field] == 'Country') {
      showErrorMsg(field, 'required');
      continue;
    }

    if (length[field] && length[field].min && user[field].length < length[field].min) {
      showErrorMsg(field, 'minlength', length[field].min);
      continue;
    }

    if (length[field] && length[field].max && user[field].length > length[field].max) {
      showErrorMsg(field, 'maxlength', length[field].max);
      continue;
    }
  }
}

function preparePassword (user) {
  delete user.confirmpass;
  user.password = window.btoa(user.password);
}

function closeModal () {
  $('form.register-form')[0].reset();
  location.hash = '#login';
  $('.modal.success-registration').hide();
  $('.login-menu [name=login]').click();
}

function register () {
  var
    user = {
      username: $(".register #username")[0].value.trim(),
      password: $(".register #password")[0].value.trim(),
      confirmpass: $(".register #confirmpass")[0].value.trim(),
      firstName: $(".register #firstName")[0].value.trim(),
      lastName: $(".register #lastName")[0].value.trim(),
      phone: $(".register #phone")[0].value.trim(),
      email: $(".register #email")[0].value.trim(),
      country: $(".register #country")[0].value.trim(),
      company: $(".register #company")[0].value.trim(),
      industry: $(".register #industry")[0].value.trim()
    };

  validateData(user);

  if ($('.errorsblock span.error-message:not([style="display: none;"])').length === 0) {
    preparePassword(user);

    $.post('signup', user)
      .done(function (data) {
        $('.modal.success-registration').show();
      })
      .fail(function (data) {
      });
  }
}

function forgotpassword () {
  var
    username = $(".forgotPassword #username")[0].value.trim(),
    email = $(".forgotPassword #email")[0].value.trim();

  $.post('forgotPassword', { username: username, email: email });

  $('form.forgot-password-form')[0].reset();

  $(".forgotPassword .first").hide();
  $(".forgotPassword .second").show();
}

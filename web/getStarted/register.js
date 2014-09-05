$(function () {
  $("#company").autocomplete({
    source: "/autocomplete/company",
    minLength: 1
  });

  $("#industry").autocomplete({
    source: "/autocomplete/industry",
    minLength: 1
  });
});

var errors = {
  required: 'This field cannot be blank.',
  minlength: 'This field must have at least $ characters.',
  maxlength: 'This field cannot be longer than $ characters.',
  uniqueUsername: 'This username is already used.',
  usernamePattern: 'Login can contain only numbers, periods and Latin letters.',
  confirmPassword: 'Passwords do not match'
};

function checkUniqueUsername () {
  var
    username = $("#username")[0].value.trim(),
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
    phone = $("#phone")[0].value.trim(),
    phoneRegexp = new RegExp('^[0-9]*$'),
    replaceRegexp = new RegExp('[^0-9]', 'g');

  hideError(el);

  if (!phoneRegexp.test(phone)) {
    $("#phone")[0].value = phone.replace(replaceRegexp, '');
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

function register () {
  var
    user = {
      username: $("#username")[0].value.trim(),
      password: $("#password")[0].value.trim(),
      confirmpass: $("#confirmpass")[0].value.trim(),
      firstName: $("#firstName")[0].value.trim(),
      lastName: $("#lastName")[0].value.trim(),
      phone: $("#phone")[0].value.trim(),
      email: $("#email")[0].value.trim(),
      country: $("#country")[0].value.trim(),
      company: $("#company")[0].value.trim(),
      industry: $("#industry")[0].value.trim()
    };

  validateData(user);

  if ($('.errorsblock span.error-message:not([style="display: none;"])').length === 0) {
    preparePassword(user);

    $.post('signup', user)
      .done(function (data) {
        $('.content').append(data);
      })
      .fail(function (data) {
      });
  }
}

var errors = {
  required: 'This field cannot be blank.',
  minlength: 'This field must have at least $ characters.',
  maxlength: 'This field cannot be longer than $ characters.',
  confirmPassword: 'Passwords do not match'
};

function hideError (elem) {
  var field = elem.id;
  $('.errorsblock span.' + field).hide();
}

function showErrorMsg (field, type, param) {
  var errorMsg = errors[type];

  if (param) {
    errorMsg = errorMsg.replace('$', param);
  }

  $('.errorsblock span.' + field)[0].innerText = errorMsg;
  $('.errorsblock span.' + field).show();
}

function validateData (data) {
  var
    length = {
      password: { min: 8, max: 20 }
    };

  if (!data.password) {
    showErrorMsg('password', 'required');
    return;
  }

  if (data.password.length < 8) {
    showErrorMsg('password', 'minlength', 8);
    return;
  }

  if (data.password.length > 20) {
    showErrorMsg('password', 'maxlength', 20);
    return;
  }

  if (data.confirmpass !== data.password) {
    showErrorMsg('confirmpass', 'confirmPassword');
    return;
  }
}

function resetPassword () {
  var
    path = location.pathname,
    data = {
      password: $("#password")[0].value.trim(),
      confirmpass: $("#confirmpass")[0].value.trim()
    };

  validateData(data);

  if ($('.errorsblock span.error-message:not([style="display: none;"])').length === 0) {
    $.post(path, { password: window.btoa(data.password) })
      .done(function (data) {
        window.document.location.href = '/login';
      })
      .fail(function (data) {
      });
  }
}

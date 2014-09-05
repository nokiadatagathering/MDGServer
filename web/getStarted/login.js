function showErrorMsg (errorName, msg) {
  if (msg) {
    $('.errorsblock span.' + errorName)[0].innerText = msg;
  }

  $('.errorsblock span.' + errorName).show();
}

function hideError () {
  $('.errorsblock span.login').hide();
}

function login () {
  var
    username = $("#username")[0].value.trim(),
    password = window.btoa($("#password")[0].value.trim());

  $.post('login', { username: username, password: password })
    .done(function (data) {
      window.document.location.href = '/#/surveys';
    })
    .fail(function (data) {
      if (data.status === 401) {
        showErrorMsg('login', data.responseJSON.message);
      }
    });
}

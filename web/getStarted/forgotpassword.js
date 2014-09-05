function forgotpassword () {
  var
    username = $("#username")[0].value.trim(),
    email = $("#email")[0].value.trim();

  $.post('forgotPassword', { username: username, email: email });

  $(".first").hide();
  $(".second").show();
}

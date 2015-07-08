(function () {
  function removeRes() {
    var body = document.querySelector('body');

    [].forEach.call(document.querySelectorAll('.results'), function (el) {
      body.removeChild(el);
    });
  }

  function setAutocomlete(el) {
    var activeIndex = -1;
    var results = [];
    var body = document.querySelector('body');

    el.addEventListener('focus', function (evt) {
      setTimeout(function(){
        hideError();
      }, 500);
    }, true);

    el.addEventListener('blur', function (evt) {
      setTimeout(function(){
        removeRes();
      }, 500);
    }, true);

    el.addEventListener('keyup', function (evt) {
      var keyCode = evt.which || evt.keyCode;

      if (keyCode === 38) {
        activeIndex = activeIndex === 0 ? results.length - 1 : --activeIndex;
        renderActiveResult(activeIndex);
        return;
      }

      if (keyCode === 40) {
        activeIndex = activeIndex === results.length - 1 ? 0 : ++activeIndex;
        renderActiveResult(activeIndex);
        return;
      }

      if (keyCode === 13) {
        el.value = results[activeIndex].username + (results[activeIndex].email ? ' / ' + results[activeIndex].email : '');
        el.setAttribute('userid', results[activeIndex]._id);
        body.removeChild(document.querySelector('.results'));
        return;
      }

      removeRes();
      activeIndex = -1;

      if (evt.target.value.trim() != '') {
        var xmlhttp = new XMLHttpRequest();

        evt.target.setAttribute('userid', '');

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 ) {
            results = JSON.parse(xmlhttp.response);

            if (xmlhttp.status == 200 && results.length) {
              var
                ul = document.createElement('ul'),
                pos = evt.target.getBoundingClientRect();

              ul.className = 'results';

              for (var i = 0; i < results.length; i++) {
                var li = document.createElement('li');

                li.innerText = results[i].username + (results[i].email ? ' / ' + results[i].email : '');
                li.id = results[i]._id;
                ul.appendChild(li)
              }

              body.appendChild(ul);
              ul.style.top = pos.top + 'px';
              ul.style.left = pos.left + 'px';
              [].forEach.call(ul.children, function (el) {
                el.addEventListener("click", function (e) {
                  evt.target.value = el.innerText;
                  evt.target.setAttribute('userid', el.id);
                  body.removeChild(ul);
                });
              });
            }
          }
        };

        xmlhttp.open("GET", "/autocomplete/user" + "?term=" + evt.target.value.trim(), true);
        xmlhttp.send();
      }
    }, true);
  }

  function ifUserSelected (userEl) {
    return userEl.getAttribute('userid') && userEl.getAttribute('userid') !== '' ? true : false;
  }


  function renderActiveResult (activeIndex) {
    var results = document.querySelectorAll('ul.results li');
    var activeResult = document.querySelector('ul.results .active');

    if (results.length !== 0) {
      results[activeIndex].classList.add('active');
    }

    if (activeResult) {
      activeResult.classList.remove('active');
    }
  }

  function showError () {
    var div = document.querySelector('div.error');
    div.style.display = 'block';
  }

  function hideError () {
    var div = document.querySelector('div.error');
    div.style.display = 'none';
  }

  function deleteUser (userEl) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 204) {
        userEl.value = '';
        userEl.setAttribute('userid', '');
      }
    };

    xmlhttp.open('POST', '/adminPage/deleteUser', true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({ user: userEl.getAttribute('userid') }));
  }

  function tryToDeleteUser () {
    var userEl = document.querySelector('input.user');

    if (!ifUserSelected(userEl)) {
      showError();
      return;
    }

    var confirmUserDelete = window.confirm('Are you sure you want to delete user "' + userEl.value + '"?');

    if (confirmUserDelete) {
      deleteUser(userEl);
    }
  }

  window.onload = function() {
    setAutocomlete(document.querySelector('input.user'));

    document.querySelector('.btn-delete-user').addEventListener('click', function (event) {
      tryToDeleteUser();
    });
  };
})();



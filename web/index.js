(function () {
    var $$ = document.querySelectorAll.bind(document),
        $ = document.getElementById.bind(document);
    
    var validators = {
        uniqeUsrName: function () {
            var xmlhttp = new XMLHttpRequest(),
                status = false;

            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 ) {
                    if(xmlhttp.status == 200) {
                        status = true;
                   }
                }
            }
            xmlhttp.open("post", "validate/undefined", false);
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
            xmlhttp.send('field=username&value=' + encodeURIComponent(this.value.trim()));
            return status;
        },
        len: function (min, max) {
            return this.value.length >= min && (max ? this.value.length <= max : true);
        },
        isAlpha: function () {
            return /^\w+$/.test(this.value);
        },
        isEmail: function () {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(this.value);
        },
        isMatch: function (input) {
            return this.form.querySelector('[name="' + input + '"]').value == this.value;
        },
        isNumber: function () {
            return /^\d+$/.test(this.value);
        }
    };
    
    function validate(input) {
        var rules = input.dataset.validation;
        if (!rules) { return; }

        input._validationErrors = [];
        var errBlock = input.parentNode.querySelector('div.error');

        rules.split(';').forEach(function (v) {
            var v = v.match(/^(\w[\w_\d]*)(\((.*[^\)])\))?$/);
            if (!v) { return; }
            var args  = [];
            if (v[2]) {
                args = v[3].split(',').map(function (arg) {
                    arg = arg.trim();
                    return /^[\d.]*$/.test(arg) ? parseFloat(arg) : arg;
                });
            }
            var vName = v[1],
                vFn = validators[vName];

            if (!vFn) {
                console.error('Unknown validator "%s" for input', vName, input);
                return;
            };

            var errMsg = input.parentNode.querySelector('span[data-validation-msg="' + vName + '"]');
            if (vFn.apply(input, args)) {
                if (errMsg) {
                    errMsg.style.display = "none";
                }
            } else {
                input._validationErrors.push(vName);
                if (errMsg) {
                    errMsg.style.display = "block";
                }
            }
        });
        if (input._validationErrors.length) {
            errBlock.style.display = "block";
        } else {
            errBlock.style.display = "none";
        }
        return input._validationErrors;
    }

    function validateForm(form) {
        var fields = form.querySelectorAll(
            'input[data-validation], select[data-validation], textarea[data-validation]');
        var isValid = true;
        for(var i = 0; i < fields.length; i++) {
            if(validate(fields[i]).length) {
                isValid = false;
            }
        }
        return isValid;
    }

    function removeRes() {
        var body = document.querySelector('body');
        [].forEach.call(document.querySelectorAll('.results'), function (el){
            body.removeChild(el);
        });
    }

    function setAutocomlite(el) {
        el.addEventListener('keyup', function (evt) {
            if (evt.target.value.trim() != '') {
                var xmlhttp = new XMLHttpRequest(),
                    body = document.querySelector('body');
                removeRes();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 ) {
                        var results = JSON.parse(xmlhttp.response);
                        if(xmlhttp.status == 200 && results.length) {
                            var items = '',
                                ul = document.createElement('ul'),
                                pos = evt.target.getBoundingClientRect();
                            ul.className = 'results';
                            for (var i = 0; i < results.length; i++) {
                                items += '<li>' + results[i] + '</li>'
                            }
                            ul.innerHTML = items;
                            body.appendChild(ul);
                            ul.style.top = pos.top + 'px';
                            ul.style.left = pos.left + 'px';
                            [].forEach.call(ul.children, function (el){
                                el.addEventListener("click", function (e){
                                    evt.target.value = el.innerText;
                                    validate(evt.target);
                                    body.removeChild(ul);
                                });
                            })
                       }
                    }
                }
        
                xmlhttp.open("GET", "/autocomplete/" + evt.target.name + "?term=" + evt.target.value.trim(), true);
                xmlhttp.send();
            }
        }, true);
    }

    function register() {
        document.querySelector('#register form').addEventListener('blur', function (evt) {
            setTimeout(function(){
                removeRes();
                validate(evt.target);
            }, 500)
        }, true);
        document.querySelector('#register form').addEventListener('submit', function (evt) {
            evt.preventDefault();
            if (validateForm(evt.target)) {
                var xmlhttp = new XMLHttpRequest(),
                    fields = evt.target.querySelectorAll('input[data-validation], select[data-validation]'),
                    data = {};
                for(var i = 0; i < fields.length; i++) {
                    data[fields[i].name] = fields[i].value.trim();
                }
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 ) {
                        if(xmlhttp.status == 204) {
                            document.querySelector('#register form').reset();
                            var modal = document.querySelector('.success-registration');
                            modal.className = modal.className.replace('hidden', '');
                       }
                    }
                }
                xmlhttp.open("post", "/signup", true);
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
                xmlhttp.send(Object.keys(data).reduce(function (a,k) {
                    if (k == 'password') { data[k] = btoa(data[k]); }
                    a.push(k+'='+encodeURIComponent(data[k]));
                    return a
                },[]).join('&'));
            }
            
        });
        document.querySelector('.success-registration input').addEventListener('click', function (evt) {
            closeModal();
        }, true);
        setAutocomlite(document.querySelector('#register form input[placeholder="Company"]'));
        setAutocomlite(document.querySelector('#register form input[placeholder="Industry"]'));
    }

    function closeModal () {
      document.querySelector('#register form').reset();
      location.hash = '/#/login';
      document.querySelector('.success-registration').className += ' hidden';
      document.querySelector('#mainMenu a[href="#/login"]').click();
    }

    function remindPass() {
        var form = document.querySelector('#forgotPassword form'),
            msg = document.querySelector('#forgotPassword .msg');

        form.style.display = 'block';
        msg.style.display = 'none';
        form.addEventListener('blur', function (evt) {
            validate(evt.target);
        }, true);
        form.addEventListener('submit', function (evt) {
            evt.preventDefault();
            if (validateForm(evt.target)) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 ) {
                        if(xmlhttp.status == 200 || xmlhttp.status == 204) {
                            evt.target.reset();
                            form.style.display = 'none';
                            msg.style.display = 'block';
                       }
                    }
                }
                xmlhttp.open("post", "/forgotPassword", true);
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
                xmlhttp.send(encodeURIComponent('email') + '=' + encodeURIComponent(evt.target.email.value.trim()) + '&' + encodeURIComponent('username') + '=' + encodeURIComponent(evt.target.username.value.trim()));
            }
        });
    }

    function resetPassword() {
        var form = document.querySelector('#resetPassword form');

        form.style.display = 'block';
        form.addEventListener('blur', function (evt) {
            validate(evt.target);
        }, true);
        form.addEventListener('submit', function (evt) {
            evt.preventDefault();
            if (validateForm(evt.target)) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 ) {
                        if(xmlhttp.status == 200 || xmlhttp.status == 204) {
                            evt.target.reset();
                            window.document.location.href = '/#/login';
                       }
                    }
                }
                xmlhttp.open("post", '/resetPassword/' + window._token, false);
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
                xmlhttp.send(encodeURIComponent('password') + '=' + encodeURIComponent(btoa(evt.target.password.value.trim())));
            }
        });
    }

    function login() {
        var form = document.querySelector('#login form');
        form.addEventListener('change', function (evt) {
            var err = document.querySelector('#login form .error');
            err.innerHTML = '';
            err.style.display = 'none';
        }, true);
        form.addEventListener('submit', function (evt) {
            evt.preventDefault();
            if (evt.target.password.value.length !== 0 && evt.target.username.value.length !== 0) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 ) {
                        if(xmlhttp.status == 200) {
                            window.document.location.href = '/#/surveys';
                       } else if (xmlhttp.status == 401) {
                           showLoginErr(JSON.parse(xmlhttp.response).message);
                       }
                    }
                }
                xmlhttp.open("post", "/login", true);
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
                xmlhttp.send(encodeURIComponent('password') + '=' + encodeURIComponent(btoa(evt.target.password.value.trim())) + '&' + encodeURIComponent('username') + '=' + encodeURIComponent(evt.target.username.value.trim()));
            } else {
                showLoginErr('Missing credentials');
            }
        });
    }
    
    function showArticle() {
        var articles = $$("article"),
            id = window.location.hash.substr(2),
            active = document.querySelector('#mainMenu a.active'),
            link = document.querySelector("a[href='" + window.location.hash + "']");
        if (active) {
            active.className = '';
        }
        if (link) {
            link.className = 'active';
        }
        id = id || 'home';
        if (id == 'surveys') {
            location.reload();
            return;
        } else if (id == 'forgotPassword') {
            document.querySelector('#forgotPassword form').style.display = 'block';
            document.querySelector('#forgotPassword .msg').style.display = 'none';
            document.querySelector('#forgotPassword form').reset();
        }
        for (var i = 0; i < articles.length; i++) {
            articles[i].style.display = "none";
        }

        if (id.indexOf('#') != -1) {
            var parts = id.split("#");
            $(parts[0]).style.display = "block";
            document.querySelector("li[data-step=" + parts[1] + "]").scrollIntoView();
            return;
        }
        if (id.indexOf('/') != -1) {
            var parts = id.split("/");
            if (parts[0] == 'resetPassword') {
                id = parts[0];
                window._token = parts[1];
            }
        }
        $(id).style.display = "block";
        //register();
        //remindPass();
        //login();
    }

    function showLoginErr(msg) {
        var span = document.createElement('span'),
            err = document.querySelector('#login form .error');
        span.className = 'data-validation-msg';
        span.innerText = msg;
        span.style.display = 'block';
        err.appendChild(span);
        err.style.display = 'block';
    }

    function toggleDropdown(e){
        var dropdown = document.querySelector('#mainMenu a.language-select ul.dropdown');
        if (!dropdown.className.match(/(?:^|\s)open(?!\S)/)) {
            dropdown.className += ' open';
        } else {
            dropdown.className = 'dropdown';
        }
    }

    window.addEventListener("load", showArticle);
    window.addEventListener('hashchange', showArticle);
    window.onload = function(){
        document.querySelector('#mainMenu a.language-select').addEventListener("click", toggleDropdown);
        [].forEach.call(document.querySelectorAll('#mainMenu a.language-select li'), function (el){
            el.addEventListener("click", function (e){
                var target = e.target ? e.target : window.event.srcElement;
                document.cookie = 'NG_TRANSLATE_LANG_KEY=%22' + target.attributes.value.value + '%22';
                location.reload();
            });
        });
        register();
        remindPass();
        resetPassword();
        login();
    };
}());

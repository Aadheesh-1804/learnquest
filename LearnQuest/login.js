// Talks to the real Spring Boot backend: POST /api/auth/login.
// The chalkboard only expands to fill the screen after the server confirms success.
var API_BASE = 'http://localhost:8080';

// If we were redirected here after a session timeout or a password reset, show a notice.
(function () {
  var params = new URLSearchParams(window.location.search);
  var errorEl = document.getElementById('loginError');
  if (params.get('expired') === '1') {
    errorEl.textContent = 'Your session expired after 5 minutes. Please log in again.';
    errorEl.hidden = false;
  } else if (params.get('reset') === '1') {
    errorEl.textContent = 'Your password has been reset. Please log in with your new password.';
    errorEl.hidden = false;
    errorEl.style.color = '#5bc97e';
  }
})();

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();

  var email = document.getElementById('email').value.trim().toLowerCase();
  var password = document.getElementById('password').value;
  var errorEl = document.getElementById('loginError');
  var submitBtn = document.querySelector('.btn');

  errorEl.hidden = true;
  errorEl.style.color = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  fetch(API_BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, password: password })
  })
    .then(function (response) {
      if (!response.ok) {
        return response.text().then(function (msg) {
          throw new Error(msg || 'Login failed.');
        });
      }
      return response.json();
    })
    .then(function (user) {
      // Remember who just logged in so the dashboard can greet them by name.
      user.isNew = false;
      sessionStorage.setItem('lq_currentUser', JSON.stringify(user));
      playExpandAnimation();
    })
    .catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
      errorEl.textContent = 'Incorrect email or password. Please try again.';
      errorEl.hidden = false;
    });
});

function playExpandAnimation() {
  var panel = document.querySelector('.panel');
  var scene = document.querySelector('.scene');
  var rect = panel.getBoundingClientRect();

  panel.style.position = 'fixed';
  panel.style.top = rect.top + 'px';
  panel.style.left = rect.left + 'px';
  panel.style.width = rect.width + 'px';
  panel.style.height = rect.height + 'px';
  panel.style.margin = '0';
  panel.style.zIndex = '1000';
  panel.style.transition = 'top .6s cubic-bezier(.65,0,.35,1), left .6s cubic-bezier(.65,0,.35,1), width .6s cubic-bezier(.65,0,.35,1), height .6s cubic-bezier(.65,0,.35,1)';

  scene.style.transition = 'opacity .3s ease';
  scene.style.opacity = '0';

  document.querySelectorAll('.chalk > *').forEach(function (el) {
    el.style.transition = 'opacity .25s ease';
    el.style.opacity = '0';
  });

  // force a reflow so the browser registers the starting position before animating
  panel.offsetHeight;

  requestAnimationFrame(function () {
    panel.style.top = '0';
    panel.style.left = '0';
    panel.style.width = '100vw';
    panel.style.height = '100vh';
  });

  setTimeout(function () {
    window.location.href = 'dashboard.html';
  }, 650);
}
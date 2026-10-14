var API_BASE = 'http://localhost:8080';

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();

  var email = document.getElementById('email').value.trim().toLowerCase();
  var password = document.getElementById('password').value;
  var confirm = document.getElementById('confirm').value;
  var errorEl = document.getElementById('resetError');
  var submitBtn = document.querySelector('.btn');

  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Resetting...';

  fetch(API_BASE + '/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, newPassword: password })
  })
    .then(function (response) {
      if (!response.ok) {
        return response.text().then(function (msg) {
          throw new Error(msg || 'Could not reset password.');
        });
      }
      return response.json();
    })
    .then(function () {
      window.location.href = 'login.html?reset=1';
    })
    .catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reset password';
      errorEl.textContent = err.message.indexOf('No account') !== -1
        ? 'No account found with this email.'
        : (err.message || 'Something went wrong. Please try again.');
      errorEl.hidden = false;
    });
});
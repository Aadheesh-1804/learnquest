// Talks to the real Spring Boot backend: POST /api/auth/register.
// The chalkboard only expands to fill the screen after the server confirms success.
var API_BASE = 'https://learnquest-nofa.onrender.com';

// ---------- Avatar picker (same 10 kid-friendly cartoon characters as the dashboard) ----------
var AVATAR_SEEDS = ['Felix', 'Aneka', 'Milo', 'Zara', 'Leo', 'Nova', 'Kai', 'Luna', 'Max', 'Ivy'];
function avatarUrl(seed) {
  return 'https://api.dicebear.com/9.x/adventurer/svg?seed=' + encodeURIComponent(seed) + '&backgroundType=solid';
}
var selectedAvatar = AVATAR_SEEDS[0];
var avatarGrid = document.getElementById('avatarGrid');

AVATAR_SEEDS.forEach(function (seed, i) {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'avatar-option';
  if (i === 0) b.classList.add('selected');
  b.dataset.value = seed;
  b.innerHTML = '<img src="' + avatarUrl(seed) + '" alt="" style="width:100%;height:100%;display:block;object-fit:cover;">';
  b.setAttribute('aria-label', 'Choose this avatar');
  b.addEventListener('click', function () {
    selectedAvatar = seed;
    avatarGrid.querySelectorAll('.avatar-option').forEach(function (o) { o.classList.remove('selected'); });
    b.classList.add('selected');
  });
  avatarGrid.appendChild(b);
});

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();

  var name = document.getElementById('name').value.trim();
  var email = document.getElementById('email').value.trim().toLowerCase();
  var password = document.getElementById('password').value;
  var confirm = document.getElementById('confirm').value;
  var errorEl = document.getElementById('registerError');
  var submitBtn = document.querySelector('.btn');

  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing up...';

  fetch(API_BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, email: email, password: password, avatar: selectedAvatar })
  })
    .then(function (response) {
      if (!response.ok) {
        return response.text().then(function (msg) {
          throw new Error(msg || 'Could not create your account.');
        });
      }
      return response.json();
    })
    .then(function (user) {
      // Remember who just signed up so the dashboard can greet them by name.
      user.isNew = true;
      sessionStorage.setItem('lq_currentUser', JSON.stringify(user));
      playExpandAnimation();
    })
    .catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign up';
      errorEl.textContent = err.message.indexOf('exists') !== -1
        ? 'An account with this email already exists. Please log in instead.'
        : (err.message || 'Something went wrong. Please try again.');
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

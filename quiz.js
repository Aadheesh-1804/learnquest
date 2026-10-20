// ---------- Config ----------
var API_BASE = 'https://learnquest-nofa.onrender.com';
var POINTS_PER_CORRECT = { EASY: 5, INTERMEDIATE: 10, ADVANCED: 20 };

// ---------- Read topic & difficulty from the URL ----------
var params = new URLSearchParams(window.location.search);
var topic = params.get('topic') || '';
var difficulty = (params.get('level') || params.get('difficulty') || 'Easy');
var difficultyUpper = difficulty.toUpperCase();

document.getElementById('quizTopicLabel').textContent = topic + ' · ' + difficulty;

// ---------- Profile comes from the real Spring Boot backend ----------
function getCurrent() {
  var raw = sessionStorage.getItem('lq_currentUser');
  return raw ? JSON.parse(raw) : null;
}
function setCurrent(obj) {
  sessionStorage.setItem('lq_currentUser', JSON.stringify(obj));
}

var current = getCurrent();
if (!current) {
  window.location.href = 'login.html';
}
var email = current ? current.email : null;

// ---------- Session expires 5 minutes after this page was opened ----------
var SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
setTimeout(function () {
  sessionStorage.removeItem('lq_currentUser');
  var expiredOverlay = document.getElementById('sessionExpiredOverlay');
  expiredOverlay.hidden = false;
  document.getElementById('sessionExpiredBtn').addEventListener('click', function () {
    window.location.href = 'login.html?expired=1';
  });
}, SESSION_DURATION_MS);

// ---------- State ----------
var questions = [];
var currentIndex = 0;
var correctCount = 0;
var answered = false;

// ---------- Elements ----------
var loadingState = document.getElementById('loadingState');
var errorState = document.getElementById('errorState');
var questionCard = document.getElementById('questionCard');
var resultCard = document.getElementById('resultCard');
var progressFill = document.getElementById('progressFill');
var qLabel = document.getElementById('qLabel');
var qText = document.getElementById('qText');
var qOptions = document.getElementById('qOptions');
var qFeedback = document.getElementById('qFeedback');
var nextBtn = document.getElementById('nextBtn');
var quizProgressText = document.getElementById('quizProgressText');

function showOnly(el) {
  [loadingState, errorState, questionCard, resultCard].forEach(function (s) { s.hidden = (s !== el); });
}

// ---------- Confetti burst (celebrates a correct answer) ----------
var CONFETTI_COLORS = ['#ffd23f', '#f5a742', '#5bc97e', '#4a74f0', '#ea5a3c', '#7fdcea', '#f6a3bd'];
function burstConfetti(originX, originY) {
  for (var i = 0; i < 16; i++) {
    var piece = document.createElement('span');
    piece.className = 'confetti-piece';
    var angle = Math.random() * Math.PI * 2;
    var distance = 50 + Math.random() * 60;
    piece.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
    piece.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
    piece.style.left = originX + 'px';
    piece.style.top = originY + 'px';
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDelay = (Math.random() * 0.1) + 's';
    document.body.appendChild(piece);
    piece.addEventListener('animationend', function () { this.remove(); });
  }
}

// ---------- Fetch questions from the Java backend ----------
function loadQuestions() {
  showOnly(loadingState);
  var url = API_BASE + '/api/quiz?topic=' + encodeURIComponent(topic) + '&difficulty=' + encodeURIComponent(difficulty);

  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('Request failed: ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!Array.isArray(data) || data.length === 0) throw new Error('No questions returned');
      questions = data;
      currentIndex = 0;
      correctCount = 0;
      showOnly(questionCard);
      renderQuestion();
    })
    .catch(function (err) {
      console.error(err);
      showOnly(errorState);
    });
}

// ---------- Render a question ----------
function renderQuestion() {
  answered = false;
  var q = questions[currentIndex];
  qLabel.textContent = 'Question ' + (currentIndex + 1);
  qText.textContent = q.questionText;
  quizProgressText.textContent = 'Question ' + (currentIndex + 1) + ' of ' + questions.length;
  progressFill.style.width = ((currentIndex) / questions.length * 100) + '%';

  qFeedback.textContent = '';
  qFeedback.className = 'quiz-feedback';
  nextBtn.hidden = true;

  var letters = ['A', 'B', 'C', 'D'];
  var optionValues = [q.optionA, q.optionB, q.optionC, q.optionD];

  qOptions.innerHTML = '';
  letters.forEach(function (letter, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option';
    btn.dataset.letter = letter;
    btn.innerHTML = '<span class="opt-letter">' + letter + '</span>' + optionValues[i];
    btn.addEventListener('click', function () { selectAnswer(btn, letter, q.id); });
    qOptions.appendChild(btn);
  });
}

function selectAnswer(btn, chosenLetter, questionId) {
  if (answered) return;
  answered = true;

  var allOptions = qOptions.querySelectorAll('.quiz-option');
  allOptions.forEach(function (o) { o.disabled = true; });

  fetch(API_BASE + '/api/quiz/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId: questionId, selectedOption: chosenLetter })
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Check failed: ' + res.status);
      return res.json();
    })
    .then(function (result) {
      var isCorrect = result.correct;
      var correctLetter = result.correctOption;

      if (isCorrect) {
        btn.classList.add('correct');
        correctCount++;
        qFeedback.textContent = '🎉 Correct! Nice work.';
        qFeedback.className = 'quiz-feedback correct-text';
        var rect = btn.getBoundingClientRect();
        burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
      } else {
        btn.classList.add('wrong');
        allOptions.forEach(function (o) {
          if (o.dataset.letter === correctLetter) o.classList.add('correct');
        });
        qFeedback.textContent = '😅 Not quite — the correct answer is highlighted.';
        qFeedback.className = 'quiz-feedback wrong-text';
      }

      nextBtn.hidden = false;
      nextBtn.textContent = (currentIndex === questions.length - 1) ? 'See results' : 'Next question';
    })
    .catch(function (err) {
      console.error(err);
      qFeedback.textContent = 'Could not check your answer. Please try again.';
      qFeedback.className = 'quiz-feedback wrong-text';
      allOptions.forEach(function (o) { o.disabled = false; });
      answered = false;
    });
}

nextBtn.addEventListener('click', function () {
  currentIndex++;
  if (currentIndex >= questions.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
});

// ---------- Finish & save points to the database ----------
function finishQuiz() {
  progressFill.style.width = '100%';

  var perQuestion = POINTS_PER_CORRECT[difficultyUpper] || 5;
  var earnedPoints = correctCount * perQuestion;

  document.getElementById('resultCorrect').textContent = correctCount + '/' + questions.length;
  document.getElementById('resultPoints').textContent = '+' + earnedPoints;

  var resultTitle = document.getElementById('resultTitle');
  var resultSub = document.getElementById('resultSub');
  if (correctCount === questions.length) {
    resultTitle.textContent = 'Perfect score!';
    resultSub.textContent = 'You got every question right on ' + topic + '.';
  } else if (correctCount >= questions.length * 0.6) {
    resultTitle.textContent = 'Great job!';
    resultSub.textContent = 'Solid round on ' + topic + '. Keep it up!';
  } else {
    resultTitle.textContent = 'Keep practicing!';
    resultSub.textContent = 'Every attempt helps you learn ' + topic + ' better.';
  }

  // Lock the buttons until the points are saved, so leaving the page can't cancel the save.
  var backBtn = document.getElementById('backToDashBtn');
  var retakeBtn = document.getElementById('retakeBtn');
  var backBtnText = backBtn.textContent;

  if (email && earnedPoints > 0) {
    backBtn.disabled = true;
    retakeBtn.disabled = true;
    backBtn.textContent = 'Saving your points...';

    fetch(API_BASE + '/api/auth/add-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, points: earnedPoints })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Could not save points');
        return res.json();
      })
      .then(function (updatedUser) {
        // Keep the session's stored profile (points, etc.) in sync with the database.
        current = updatedUser;
        setCurrent(updatedUser);
      })
      .catch(function (err) {
        console.error(err);
        resultSub.textContent = 'We could not save your points this time. Please check your connection and try again.';
      })
      .finally(function () {
        backBtn.disabled = false;
        retakeBtn.disabled = false;
        backBtn.textContent = backBtnText;
      });
  }

  showOnly(resultCard);
}

// ---------- Navigation ----------
document.getElementById('exitBtn').addEventListener('click', function () {
  window.location.href = 'dashboard.html';
});
document.getElementById('backToDashBtn').addEventListener('click', function () {
  window.location.href = 'dashboard.html';
});
document.getElementById('retakeBtn').addEventListener('click', function () {
  loadQuestions();
});
document.getElementById('retryBtn').addEventListener('click', function () {
  loadQuestions();
});

// ---------- Start ----------
loadQuestions();

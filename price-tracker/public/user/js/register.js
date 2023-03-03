const alertBox = document.getElementById('alert-box');
const emailRef = document.getElementById('email');
const usernameRef = document.getElementById('username');
const passwordRef = document.getElementById('password');

async function onLoad() {
  const res = await fetch('/api/user/login/validate-session');
  if (res.ok) window.location.href = '/';
}

async function onRegisterFormSubmit(event) {
  event.preventDefault();

  const email = emailRef.value;
  const username = usernameRef.value;
  const password = passwordRef.value;

  if (
    !(
      validatePassword(password) &&
      (await validateEmail(email)) &&
      (await validateUsername(username))
    )
  )
    return;

  const res = await fetch('/api/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password }),
  });

  if (res.ok) {
    window.location.href = '/login';
  } else {
    showAlert('Something went wrong. Please try again.');
  }
}

async function validateEmail(email) {
  const res = await fetch('/api/user/register/validate-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (res.ok) return true;

  showAlert('Email is already in use.');
  return false;
}

async function validateUsername(username) {
  const res = await fetch('/api/user/register/validate-username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (res.ok) return true;

  showAlert('Username is already in use.');
  return false;
}

function validatePassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$&*]).{8,}$/;

  if (passwordRegex.test(password)) return true;

  showAlert(
    'Password must contain at least 8 characters, <br />' +
      '1 uppercase letter, 1 lowercase letter, <br />' +
      '1 number, and 1 special character.'
  );
}

function showAlert(message) {
  alertBox.innerHTML = message;
  alertBox.classList.remove('hidden');
}

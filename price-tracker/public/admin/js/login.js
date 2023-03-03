const alertBox = document.getElementById('alert-box');
const usernameRef = document.getElementById('username');
const passwordRef = document.getElementById('password');

async function onLoad() {
  const res = await fetch('/api/admin/login/validate-session');
  if (res.ok) window.location.href = '/admin/product-data';
}

async function onLoginFormSubmit(event) {
  event.preventDefault();

  const username = usernameRef.value;
  const password = passwordRef.value;

  if (!(await validateUsername(username))) return;

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 200) {
    window.location.href = '/admin/product-data';
  } else if (res.status === 401) {
    showAlert('Invalid password.');
  } else {
    showAlert('Something went wrong. Please try again.');
  }
}

async function validateUsername(username) {
  const res = await fetch('/api/admin/login/validate-username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (res.ok) return true;

  showAlert('User not found.');
  return false;
}

function showAlert(message) {
  alertBox.innerHTML = message;
  alertBox.classList.remove('hidden');
}

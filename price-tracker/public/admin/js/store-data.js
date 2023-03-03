const input = document.getElementById('stores-input');
const alertBox = document.getElementById('alert-box');
const alertColorClasses = {
  info: ['bg-blue-200', 'text-blue-700'],
  success: ['bg-green-200', 'text-green-700'],
  warning: ['bg-yellow-200', 'text-yellow-700'],
  error: ['bg-red-200', 'text-red-700'],
};

async function onLoad() {
  // Check if user is logged in
  const res = await fetch('/api/admin/login/validate-session');
  if (!res.ok) window.location.href = '/admin/login';
}

async function deleteData() {
  alertBox.classList.add('hidden');

  if (!confirm('Are you sure you want to delete all store data?')) return;

  showAlert({ message: 'Deleting...' });

  const res = await fetch('/api/admin/stores', {
    method: 'DELETE',
  });

  if (res.status === 200) {
    showAlert({ type: 'success', message: 'Data deleted.' });
  } else if (res.status === 204) {
    showAlert({ type: 'warning', message: 'No data to delete.' });
  } else {
    showAlert({
      type: 'error',
      message: 'Something went wrong. Please try again.',
    });
  }
}

async function uploadStores() {
  alertBox.classList.add('hidden');

  if (input.files.length === 0) return;

  showAlert({ message: 'Uploading...' });

  const stores = await new Response(input.files[0]).json();

  const res = await fetch('/api/admin/stores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stores),
  });

  if (res.status === 201) {
    showAlert({
      type: 'success',
      message: 'Data was uploaded.',
    });
  } else if (res.status === 200) {
    showAlert({
      type: 'warning',
      message: 'No data to update.',
    });
  } else {
    showAlert({
      type: 'error',
      message: 'Something went wrong. Please try again.',
    });
  }
}

function showAlert({ type = 'info', message = '' }) {
  for (const key in alertColorClasses) {
    alertBox.classList.remove(...alertColorClasses[key]);
  }
  alertBox.classList.add(...alertColorClasses[type]);
  alertBox.innerHTML = message;
  alertBox.classList.remove('hidden');
}

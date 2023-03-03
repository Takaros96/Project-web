const usersListref = document.getElementById('users-list');
const pageButtonsRef = document.getElementById('page-buttons');
let users = [];
const pageLimit = 10;
let currentPage = 1;

async function onLoad() {
  // Check if user is logged in
  const res = await fetch('/api/admin/login/validate-session');
  if (!res.ok) window.location.href = '/admin/login';

  // Get users
  const resUsers = await fetch(`/api/admin/users?limit=${pageLimit}&offset=0`);
  users = await resUsers.json();

  // Create user divs
  users.forEach((user) => {
    usersListref.appendChild(createUserDiv(user));
  });
}

function createUserDiv(user) {
  const mainDiv = document.createElement('div');
  mainDiv.classList.add('flex', 'justify-center', 'mb-4', 'w-4/6');

  const secondDiv = document.createElement('div');
  secondDiv.classList.add(
    'block',
    'p-6',
    'rounded-lg',
    'shadow-lg',
    'bg-white',
    'w-full'
  );

  const rowDiv = document.createElement('div');
  rowDiv.classList.add('flex', 'flex-row', 'justify-between');

  const id = document.createElement('p');
  id.classList.add('text-gray-700', 'text-base');
  id.innerText = `ID: ${user.id}`;

  const username = document.createElement('h2');
  username.classList.add('text-2xl', 'font-bold', 'text-gray-800');
  username.innerText = user.username;

  const currentTokens = document.createElement('p');
  currentTokens.classList.add('text-gray-700', 'text-base');
  currentTokens.innerText = `Current Tokens: ${user.current_tokens}`;

  const totalTokens = document.createElement('p');
  totalTokens.classList.add('text-gray-700', 'text-base');
  totalTokens.innerText = `Total Tokens: ${user.total_tokens}`;

  rowDiv.appendChild(id);
  rowDiv.appendChild(username);
  rowDiv.appendChild(currentTokens);
  rowDiv.appendChild(totalTokens);

  secondDiv.appendChild(rowDiv);
  mainDiv.appendChild(secondDiv);

  return mainDiv;
}

async function prevPage() {
  if (currentPage === 1) return;

  currentPage--;
  // Get users
  const resUsers = await fetch(
    `/api/admin/users?limit=${pageLimit}&offset=${currentPage * pageLimit}`
  );
  users = await resUsers.json();

  // Clear users
  usersListref.innerHTML = '';

  // Create user divs
  users.forEach((user) => {
    usersListref.appendChild(createUserDiv(user));
  });
}

async function nextPage() {
  // Get users
  const resUsers = await fetch(
    `/api/admin/users?limit=${pageLimit}&offset=${currentPage * pageLimit}`
  );
  users = await resUsers.json();

  if (users.length === 0) return;
  currentPage++;

  // Clear users
  usersListref.innerHTML = '';

  // Create user divs
  users.forEach((user) => {
    usersListref.appendChild(createUserDiv(user));
  });
}

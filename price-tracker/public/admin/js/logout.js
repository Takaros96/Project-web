async function logout() {
  const res = await fetch('/api/logout');
  if (res.ok) window.location.href = '/admin/login';
}

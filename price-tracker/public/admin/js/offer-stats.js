const graphRef = document.getElementById('graph');
const monthInputRef = document.getElementById('month-input');
const yearInputRef = document.getElementById('year-input');
let chart = null;

async function onLoad() {
  // Check if user is logged in
  const res = await fetch('/api/admin/login/validate-session');
  if (!res.ok) window.location.href = '/admin/login';
}

async function onMonthSelect() {
  if (monthInputRef.value === '' || yearInputRef.value === '') return;

  const days = daysInMonth(monthInputRef.value, yearInputRef.value);

  const res = await fetch(
    `/api/admin/stats?month=${monthInputRef.value}&year=${yearInputRef.value}`
  );
  const resData = await res.json();

  const labels = [];
  const data = [];

  for (let i = 1; i <= days; i++) {
    labels.push(i);
    data.push(0);
  }

  for (const offer of resData) {
    data[offer.day - 1] = offer.amount;
  }

  if (chart) chart.destroy();
  chart = new Chart(graphRef, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '# of Offers',
          data: data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

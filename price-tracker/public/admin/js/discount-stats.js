const graphRef = document.getElementById('graph');
let chart = null;

const categorySelectRef = document.getElementById('category-select');
const subcategorySelectRef = document.getElementById('subcategory-select');

const weekInputRef = document.getElementById('week-input');
const yearInputRef = document.getElementById('year-input');

async function onLoad() {
  // Check if user is logged in
  const res = await fetch('/api/admin/login/validate-session');
  if (!res.ok) window.location.href = '/admin/login';

  // Get categories
  const categoriesRes = await fetch('/api/categories');
  const categories = await categoriesRes.json();
  categories.forEach(({ id, name }) => {
    const option = document.createElement('option');
    option.value = id;
    option.text = name;
    categorySelectRef.appendChild(option);
  });
}

async function onCategoryChange() {
  if (categorySelectRef.value === '') return;

  const res = await fetch(
    `/api/subcategories?parent_category_id=${categorySelectRef.value}`
  );
  const data = await res.json();

  // Clear subcategory select
  subcategorySelectRef.innerHTML = '';

  // Add default option
  const option = document.createElement('option');
  option.value = '';
  option.text = 'Select subcategory...';
  subcategorySelectRef.appendChild(option);

  // Add subcategories
  data.forEach(({ id, name }) => {
    const option = document.createElement('option');
    option.value = id;
    option.text = name;
    subcategorySelectRef.appendChild(option);
  });
}

async function onWeekSelect() {
  if (weekInputRef.value === '' || yearInputRef.value === '') return;

  const res = await fetch(
    `/api/admin/stats?week=${weekInputRef.value}&year=${yearInputRef.value}&${
      subcategorySelectRef.value === ''
        ? `category_id=${categorySelectRef.value}`
        : `subcategory_id=${subcategorySelectRef.value}`
    }`
  );
  const resData = await res.json();

  if (chart) chart.destroy();
  chart = new Chart(graphRef, {
    type: 'bar',
    data: {
      labels: ['amount'],
      datasets: [
        {
          label: 'Discount % since last week',
          data: [resData],
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

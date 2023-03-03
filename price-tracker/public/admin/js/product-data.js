const categoriesInput = document.getElementById('categories-input');
const productsInput = document.getElementById('products-input');
const pricesInput = document.getElementById('prices-input');
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

  if (
    !confirm('Are you sure you want to delete all product and category data?')
  )
    return;

  showAlert({ message: 'Deleting...' });

  const res = await fetch('/api/admin/categories', {
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

async function uploadCategories() {
  alertBox.classList.add('hidden');

  if (categoriesInput.files.length === 0) return;

  showAlert({ message: 'Uploading...' });

  // Transform categories for insertion into database
  // [{id, name, subcategories: [{id, name}]}] -> [{id, name}], [{id, name, parent_category_id}]
  const categories = await new Response(categoriesInput.files[0]).json();
  const insertCategories = [];
  const insertSubcategories = [];
  categories.forEach(({ id, name, subcategories }) => {
    insertCategories.push({ id, name });
    subcategories.forEach((subcat) => {
      insertSubcategories.push({
        id: subcat.id,
        name: subcat.name,
        parent_category_id: id,
      });
    });
  });

  const resCategories = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(insertCategories),
  });

  const resSubcategories = await fetch('/api/admin/subcategories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(insertSubcategories),
  });

  if (resCategories.ok && resSubcategories.ok) {
    showAlert({
      type: 'success',
      message: 'Data was uploaded.',
    });
  } else {
    showAlert({
      type: 'error',
      message: 'Something went wrong. Please try again.',
    });
  }
}

async function uploadProducts() {
  alertBox.classList.add('hidden');

  if (productsInput.files.length === 0) return;

  showAlert({ message: 'Uploading...' });

  // Transform products for insertion into database
  // [{id, name, category, subcategory}] -> [{id, name, subcategory_id}]
  const products = await new Response(productsInput.files[0]).json();
  const insertProducts = products.map(({ id, name, subcategory }) => ({
    id,
    name,
    subcategory_id: subcategory,
  }));

  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(insertProducts),
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

async function uploadPrices() {
  alertBox.classList.add('hidden');

  if (pricesInput.files.length === 0) return;

  showAlert({ message: 'Uploading...' });

  // Transform prices for insertion into database
  // [{id, prices: [{date, price}]}] -> [{product_id, date, price}]
  const pricesData = await new Response(pricesInput.files[0]).json();
  const insertPrices = [];
  pricesData.forEach(({ id, prices }) => {
    prices.forEach(({ date, price }) => {
      insertPrices.push({ product_id: id, date, price });
    });
  });

  const res = await fetch('/api/admin/prices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(insertPrices),
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

const storeId = parseInt(window.location.href.split('/').pop());

const categorySelectRef = document.getElementById('category-select');
const subcategorySelectRef = document.getElementById('subcategory-select');

const searchInputRef = document.getElementById('search-input');

const productSelectRef = document.getElementById('product-select');
const priceInputRef = document.getElementById('price-input');

const alertBox = document.getElementById('alert-box');

categorySelectRef.onchange = () => {
  categorySelectRef.classList.remove('border-red-500');
};

subcategorySelectRef.onchange = () => {
  subcategorySelectRef.classList.remove('border-red-500');
};

searchInputRef.onchange = () => {
  searchInputRef.classList.remove('border-red-500');
};

productSelectRef.onchange = () => {
  productSelectRef.classList.remove('border-red-500');
};

async function onLoad() {
  // Check if user is logged in
  const res = await fetch('/api/user/login/validate-session');
  if (!res.ok) window.location.href = '/login';

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

async function onCategorySelect() {
  // Check if category is selected
  if (categorySelectRef.value === '') {
    categorySelectRef.classList.add('border-red-500');
    return;
  }

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

async function onSubcategorySelect() {
  // Check if subcategory is selected
  if (subcategorySelectRef.value === '') {
    subcategorySelectRef.classList.add('border-red-500');
    return;
  }

  const res = await fetch(
    `/api/products?subcategory_id=${subcategorySelectRef.value}`
  );
  const data = await res.json();

  // Clear product select
  productSelectRef.innerHTML = '';

  // Add default option
  const option = document.createElement('option');
  option.value = '';
  option.text = 'Select product...';
  productSelectRef.appendChild(option);

  // Add products
  data.forEach(({ id, name }) => {
    const option = document.createElement('option');
    option.value = id;
    option.text = name;
    productSelectRef.appendChild(option);
  });
}

async function onProductSearch() {
  // Check if search is more than 3 characters
  if (searchInputRef.value < 3) {
    searchInputRef.classList.add('border-red-500');
    return;
  }

  const res = await fetch(`/api/products?name=${searchInputRef.value}`);
  const data = await res.json();

  // Clear product select
  productSelectRef.innerHTML = '';

  // Add default option
  const option = document.createElement('option');
  option.value = '';
  option.text = 'Select product...';
  productSelectRef.appendChild(option);

  // Add products
  data.forEach(({ id, name }) => {
    const option = document.createElement('option');
    option.value = id;
    option.text = name;
    productSelectRef.appendChild(option);
  });
}

async function onCreateOffer() {
  if (productSelectRef.value === '') {
    productSelectRef.classList.add('border-red-500');
    return;
  }

  const res = await fetch(`/api/user/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      store_id: storeId,
      product_id: productSelectRef.value,
      price: priceInputRef.value,
    }),
  });

  if (res.status === 201) {
    window.location.href = '/';
  } else if (res.status === 409) {
    showAlert('Another offer already exists.');
  } else {
    showAlert('Something went wrong.');
  }
}

function showAlert(message) {
  alertBox.innerHTML = message;
  alertBox.classList.remove('hidden');
}

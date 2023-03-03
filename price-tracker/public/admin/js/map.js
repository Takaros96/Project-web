const map = L.map('map');
const userPos = { lat: 0, lng: 0 };

const storesLayer = L.layerGroup().addTo(map);
const mapRef = document.getElementById('map');

const filterRowRef = document.getElementById('filter-row');
const searchInputRef = document.getElementById('search-input');
const categorySelectRef = document.getElementById('category-filter');

const alertBox = document.getElementById('alert-box');
const alertColorClasses = {
  info: ['bg-blue-200', 'text-blue-700'],
  error: ['bg-red-200', 'text-red-700'],
};

searchInputRef.onchange = () => {
  searchInputRef.classList.remove('border-red-500');
};

categorySelectRef.onchange = () => {
  categorySelectRef.classList.remove('border-red-500');
};

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

  showAlert({
    type: 'info',
    message: 'Fetching location...',
  });

  getLocation({ callback: loadMap });
}

function getLocation({ callback }) {
  if (!navigator.geolocation) {
    showAlert({
      type: 'error',
      message: 'Geolocation is not supported by your browser',
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude } }) => {
      userPos.lat = latitude;
      userPos.lng = longitude;
      callback({ lat: latitude, lng: longitude });
    },
    (error) => {
      showAlert({
        type: 'error',
        message: error.message,
      });
    }
  );
}

async function loadMap({ lat, lng, zoom = 13 }) {
  alertBox.classList.add('hidden');
  mapRef.classList.remove('hidden');
  filterRowRef.classList.remove('hidden');
  filterRowRef.classList.add('flex');

  const mapConfig = {
    url: 'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=b0da110cc76a40b28d0a8014ffdcc52f',
    attribution:
      'Maps &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
  };

  map.setView([lat, lng], zoom);
  L.tileLayer(mapConfig.url, mapConfig).addTo(map);

  const res = await fetch(`/api/stores?with_offers=true`);
  const data = await res.json();

  addStoreMarkers({ stores: data });
}

async function onSearchByName() {
  // Min length of 3 characters
  if (searchInputRef.value.length < 3) {
    searchInputRef.classList.add('border-red-500');
    return;
  }

  const res = await fetch(`/api/stores?name=${searchInputRef.value}`);
  const data = await res.json();

  addStoreMarkers({ stores: data });
}

async function onFilterByCategory() {
  // Check if category is selected
  if (categorySelectRef.value === '') {
    categorySelectRef.classList.add('border-red-500');
    return;
  }

  const res = await fetch(`/api/stores?category_id=${categorySelectRef.value}`);
  const data = await res.json();

  addStoreMarkers({ stores: data });
}

async function addStoreMarkers({ stores }) {
  storesLayer.clearLayers();
  const greenIcon = L.icon({
    iconUrl: '/public/assets/pin-green.png',
    iconSize: [32, 32],
    iconAnchor: [12, 41],
    popupAnchor: [5, -34],
    shadowSize: [41, 41],
  });
  const redIcon = L.icon({
    iconUrl: '/public/assets/pin-red.png',
    iconSize: [32, 32],
    iconAnchor: [12, 41],
    popupAnchor: [5, -34],
    shadowSize: [41, 41],
  });

  for (const store of stores) {
    L.marker([store.latitude, store.longitude], {
      icon: store.offers_amount > 0 ? greenIcon : redIcon,
    })
      .bindPopup(await getPopup(store))
      .addTo(storesLayer);
  }
}

async function getPopup(store) {
  if (store.offers_amount > 0) {
    const res = await fetch(`/api/user/offers?store_id=${store.id}`);
    const offers = await res.json();

    return `
    <div class="flex flex-col items-center">
      <h1 class="text-lg font-bold">${store.name}</h1>
      <h5 class="font-light text-sm text-gray-500">${store.type}</h5>

      <div class="flex flex-col items-center">
        ${offers.map(
          (offer) =>
            `<div class="mb-2 py-4 px-3 flex flex-col justify-center items-center rounded-md bg-gray-100">
              <h3 class="text-md">${offer.product_name}</h3>
              <h6 class="text-sm font-light text-gray-500">${
                offer.offer_date
              }</h6>
              <h4 class="text-md font-bold">${offer.offer_price}</h4>
              <div class="flex flex-row">
              ${
                offer.day_avg
                  ? `<h6 class="text-sm mr-2 font-light text-green-500">20% day</h6>`
                  : '<h6 class="text-sm ml-2 font-light text-red-500">20% day</h6>'
              }
              ${
                offer.week_avg
                  ? `<h6 class="text-sm font-light text-green-500">20% week</h6>`
                  : '<h6 class="text-sm font-light text-red-500">20% week</h6>'
              }
              </div>
              ${
                offer.in_stock
                  ? `<h6 class="text-sm font-light text-green-500">In stock</h6>`
                  : '<h6 class="text-sm font-light text-red-500">Out of stock</h6>'
              }
              
              <div class="flex flex-row">
                <h4 class="text-md mr-2 font-bold text-green-500">${
                  offer.likes
                } likes</h4>
                <h4 class="text-md ml-2 font-bold text-red-500">${
                  offer.dislikes
                } dislikes</h4>
              </div>

              <button
              onclick="onOfferDelete(${offer.offer_id})"
              style="color:#fff;" class='inline-block px-7 py-3 mt-3 bg-red-500 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-red-600 hover:shadow-lg focus:bg-red-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-700 active:shadow-lg transition duration-150 ease-in-out'>Delete</button>
              
            </div>`
        )}
      </div>
      </ul>
    `;
  } else {
    return `
    <div class="flex flex-col items-center">
      <h1 class="text-lg font-bold">${store.name}</h1>
      <h5 class="font-light text-sm text-gray-500">${store.type}</h5>

      <h5 class="text-sm">No offers available</h5>
    </div>
    `;
  }
}

async function onOfferDelete(id) {
  const res = await fetch(`/api/admin/offers?id=${id}`, {
    method: 'DELETE',
  });

  if (res.ok) window.location.reload();
}

function showAlert({ type = 'info', message = '' }) {
  for (const key in alertColorClasses) {
    alertBox.classList.remove(...alertColorClasses[key]);
  }
  alertBox.classList.add(...alertColorClasses[type]);
  alertBox.innerHTML = message;
  alertBox.classList.remove('hidden');
}

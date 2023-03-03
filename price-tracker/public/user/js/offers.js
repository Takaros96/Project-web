const storeId = parseInt(window.location.href.split('/').pop());

const offersContainerRef = document.getElementById('offers-container');

async function onLoad() {
  // Check if user is logged in
  const res = await fetch('/api/user/login/validate-session');
  if (!res.ok) window.location.href = '/login';

  const resOffers = await fetch(`/api/user/offers?store_id=${storeId}`);
  const offers = await resOffers.json();

  offers.forEach((offer) => {
    offersContainerRef.appendChild(createOfferDiv(offer));
  });
}

// Function to create divs for each offer
function createOfferDiv(offer) {
  const mainDiv = document.createElement('div');
  mainDiv.classList.add('flex', 'justify-center', 'mb-4');

  const secondDiv = document.createElement('div');
  secondDiv.classList.add(
    'block',
    'p-6',
    'rounded-lg',
    'shadow-lg',
    'bg-white',
    'max-w-sm',
    'w-5/6'
  );

  const offerTitle = document.createElement('h5');
  offerTitle.innerHTML = offer.product_name;
  offerTitle.classList.add(
    'text-gray-900',
    'text-xl',
    'leading-tight',
    'font-medium'
  );

  const offerDetails = document.createElement('h6');
  offerDetails.innerHTML = `${offer.user_username} - ${offer.user_total_score} <br> ${offer.offer_date}`;
  offerDetails.classList.add(
    'text-gray-600',
    'text-sm',
    'leading-tight',
    'font-light'
  );

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('flex', 'flex-col', 'items-center', 'mb-4');

  const price = document.createElement('h4');
  price.innerHTML = offer.offer_price;
  price.classList.add('text-gray-900', 'text-xl', 'leading-tight', 'font-bold');

  const avgDiv = document.createElement('div');
  avgDiv.classList.add('flex', 'flex-col', 'items-center', 'mb-2');

  const dayAvg = document.createElement('h6');
  dayAvg.innerHTML = '20% down from yesterday';
  dayAvg.classList.add(
    offer.day_avg ? 'text-green-500' : 'text-red-500',
    'text-sm',
    'leading-tight',
    'font-light',
    'ml-2'
  );

  const weekAvg = document.createElement('h6');
  weekAvg.innerHTML = '20% down from last week';
  weekAvg.classList.add(
    offer.week_avg ? 'text-green-500' : 'text-red-500',
    'text-sm',
    'leading-tight',
    'font-light',
    'ml-2'
  );

  const stockDiv = document.createElement('div');
  stockDiv.classList.add('flex', 'flex-row', 'items-center');

  const stock = document.createElement('h6');
  stock.innerHTML = offer.in_stock != "0" ? 'In Stock' : 'Out of Stock';
  stock.classList.add(
    offer.in_stock != "0" ? 'text-green-500' : 'text-red-500',
    'text-sm',
    'leading-tight',
    'font-light'
  );

  const stockButton = document.createElement('button');
  stockButton.onclick = () =>
    updateStock({ currentStock: offer.in_stock, offerId: offer.offer_id });
  stockButton.innerHTML = 'Update Stock';
  stockButton.classList.add(
    'ml-2',
    'px-2',
    'py-1',
    'bg-blue-500',
    'text-white',
    'rounded',
    'text-xs',
    'font-medium',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-600',
    'focus:ring-opacity-50'
  );

  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('flex', 'flex-row', 'justify-center', 'items-center');

  const likesInfo = document.createElement('h6');
  likesInfo.innerHTML = offer.likes;
  likesInfo.classList.add(
    'text-green-700',
    'text-lg',
    'leading-tight',
    'font-normal',
    'mr-2'
  );

  const likeButton = document.createElement('button');
  likeButton.onclick = () =>
    addReview({ isPositive: true, offerId: offer.offer_id });
  if (!offer.in_stock) likeButton.disabled = true;
  likeButton.innerHTML = 'Like';
  likeButton.classList.add(
    'inline-block',
    'px-7',
    'py-3',
    'bg-green-500',
    'text-white',
    'font-medium',
    'text-sm',
    'leading-snug',
    'uppercase',
    'rounded',
    'shadow-md',
    'hover:bg-green-600',
    'hover:shadow-lg',
    'focus:bg-green-600',
    'focus:shadow-lg',
    'focus:outline-none',
    'focus:ring-0',
    'active:bg-green-700',
    'active:shadow-lg',
    'transition',
    'duration-150',
    'ease-in-out',
    'mr-2'
  );
  const dislikeButton = document.createElement('button');
  dislikeButton.onclick = () =>
    addReview({ isPositive: false, offerId: offer.offer_id });
  if (!offer.in_stock) dislikeButton.disabled = true;
  dislikeButton.innerHTML = 'Dislike';
  dislikeButton.classList.add(
    'inline-block',
    'px-7',
    'py-3',
    'bg-red-500',
    'text-white',
    'font-medium',
    'text-sm',
    'leading-snug',
    'uppercase',
    'rounded',
    'shadow-md',
    'hover:bg-red-600',
    'hover:shadow-lg',
    'focus:bg-red-600',
    'focus:shadow-lg',
    'focus:outline-none',
    'focus:ring-0',
    'active:bg-red-700',
    'active:shadow-lg',
    'transition',
    'duration-150',
    'ease-in-out',
    'ml-2'
  );

  const dislikesInfo = document.createElement('h6');
  dislikesInfo.innerHTML = offer.dislikes;
  dislikesInfo.classList.add(
    'text-red-700',
    'text-lg',
    'leading-tight',
    'font-normal',
    'ml-2'
  );

  buttonDiv.appendChild(likesInfo);
  buttonDiv.appendChild(likeButton);
  buttonDiv.appendChild(dislikeButton);
  buttonDiv.appendChild(dislikesInfo);

  avgDiv.appendChild(dayAvg);
  avgDiv.appendChild(weekAvg);

  stockDiv.appendChild(stock);
  stockDiv.appendChild(stockButton);

  contentDiv.appendChild(price);
  contentDiv.appendChild(avgDiv);
  contentDiv.appendChild(stockDiv);

  secondDiv.appendChild(offerTitle);
  secondDiv.appendChild(offerDetails);
  secondDiv.appendChild(contentDiv);
  secondDiv.appendChild(buttonDiv);

  mainDiv.appendChild(secondDiv);

  return mainDiv;
}

async function updateStock({ currentStock, offerId }) {
  const res = await fetch(`/api/user/stock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      offerId: offerId,
      inStock: !currentStock,
    }),
  });

  if (res.ok) window.location.reload();
}

async function addReview({ isPositive, offerId }) {
  const res = await fetch('/api/user/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isPositive, offerId }),
  });

  if (res.ok) window.location.reload();
}

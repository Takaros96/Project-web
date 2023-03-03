const alertBox = document.getElementById('alert-box');
const usernameRef = document.getElementById('username');
const passwordRef = document.getElementById('password');

const offersListRef = document.getElementById('offers-list');
const reviewsListRef = document.getElementById('reviews-list');

const currentScoreRef = document.getElementById('current-score');
const totalScoreRef = document.getElementById('total-score');
const currentTokensRef = document.getElementById('current-tokens');
const totalTokensRef = document.getElementById('total-tokens');

async function onLoad() {
  // Check if user is logged in
  const res = await fetch('/api/user/login/validate-session');
  if (!res.ok) window.location.href = '/login';

  const resOffers = await fetch(`/api/user/offers`);
  const offers = await resOffers.json();

  const resReviews = await fetch(`/api/user/reviews`);
  const reviews = await resReviews.json();

  const resTokens = await fetch('/api/user/account');
  const tokens = await resTokens.json();
  console.log(tokens);

  currentScoreRef.innerHTML = `Current Score: ${tokens.current_score}`;
  totalScoreRef.innerHTML = `Total Score: ${tokens.total_score}`;
  currentTokensRef.innerHTML = `Previous Month Tokens: ${tokens.prev_month_tokens}`;
  totalTokensRef.innerHTML = `Total Tokens: ${tokens.total_tokens}`;

  if (offers.length === 0) {
    offersListRef.innerHTML = 'No offers found';
  }
  offers.forEach((offer) => {
    offersListRef.appendChild(createOfferDiv(offer));
  });

  if (reviews.length === 0) {
    reviewsListRef.innerHTML = 'No reviews found';
  }
  reviews.forEach((review) => {
    reviewsListRef.appendChild(createReviewDiv(review));
  });
}

async function onAccountFormSubmit(event) {
  event.preventDefault();

  const username = usernameRef.value;
  const password = passwordRef.value;

  if (!(validatePassword(password) && (await validateUsername(username))))
    return;

  const res = await fetch('/api/user/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    window.location.href = '/';
  } else {
    showAlert('Something went wrong. Please try again.');
  }
}

async function validateUsername(username) {
  const res = await fetch('/api/user/account/validate-username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (res.ok) return true;

  showAlert('Username is already in use.');
  return false;
}

function validatePassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$&*]).{8,}$/;

  if (passwordRegex.test(password)) return true;

  showAlert(
    'Password must contain at least 8 characters, <br />' +
      '1 uppercase letter, 1 lowercase letter, <br />' +
      '1 number, and 1 special character.'
  );
}

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
  offerDetails.innerHTML = offer.offer_date;
  offerDetails.classList.add(
    'text-gray-600',
    'text-sm',
    'leading-tight',
    'font-light'
  );

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('flex', 'flex-col', 'items-center', 'mb-4');

  const price = document.createElement('h4');
  price.innerHTML = offer.price;
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

  const stock = document.createElement('h6');
  stock.innerHTML = offer.in_stock ? 'In Stock' : 'Out of Stock';
  stock.classList.add(
    offer.in_stock ? 'text-green-500' : 'text-red-500',
    'text-sm',
    'leading-tight',
    'font-light'
  );

  const likesDiv = document.createElement('div');
  likesDiv.classList.add('flex', 'flex-row', 'justify-center', 'items-center');

  const likesInfo = document.createElement('h6');
  likesInfo.innerHTML = offer.likes;
  likesInfo.classList.add(
    'text-green-700',
    'text-lg',
    'leading-tight',
    'font-normal',
    'mr-2'
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

  likesDiv.appendChild(likesInfo);
  likesDiv.appendChild(dislikesInfo);

  avgDiv.appendChild(dayAvg);
  avgDiv.appendChild(weekAvg);

  contentDiv.appendChild(price);
  contentDiv.appendChild(avgDiv);
  contentDiv.appendChild(stock);
  contentDiv.appendChild(likesDiv);

  secondDiv.appendChild(offerTitle);
  secondDiv.appendChild(offerDetails);
  secondDiv.appendChild(contentDiv);

  mainDiv.appendChild(secondDiv);

  return mainDiv;
}

function createReviewDiv(review) {
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

  const reviewTitle = document.createElement('h5');
  reviewTitle.innerHTML = review.product_name;
  reviewTitle.classList.add(
    'text-gray-900',
    'text-xl',
    'leading-tight',
    'font-medium'
  );

  const reviewDetails = document.createElement('h6');
  reviewDetails.innerHTML = `${review.user_username} - ${review.user_total_score} <br> Offer Date: ${review.offer_date}`;
  reviewDetails.classList.add(
    'text-gray-600',
    'text-sm',
    'leading-tight',
    'font-light'
  );

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('flex', 'flex-col', 'items-center', 'mb-4');

  const price = document.createElement('h4');
  price.innerHTML = review.price;
  price.classList.add('text-gray-900', 'text-xl', 'leading-tight', 'font-bold');

  const reviewType = document.createElement('h4');
  reviewType.innerHTML = review.is_positive ? 'Positive' : 'Negative';
  reviewType.classList.add(
    review.is_positive ? 'text-green-500' : 'text-red-500',
    'text-xl',
    'leading-tight',
    'font-bold'
  );

  const avgDiv = document.createElement('div');
  avgDiv.classList.add('flex', 'flex-col', 'items-center', 'mb-2');

  const dayAvg = document.createElement('h6');
  dayAvg.innerHTML = '20% down from yesterday';
  dayAvg.classList.add(
    review.day_avg ? 'text-green-500' : 'text-red-500',
    'text-sm',
    'leading-tight',
    'font-light',
    'ml-2'
  );

  const weekAvg = document.createElement('h6');
  weekAvg.innerHTML = '20% down from last week';
  weekAvg.classList.add(
    review.week_avg ? 'text-green-500' : 'text-red-500',
    'text-sm',
    'leading-tight',
    'font-light',
    'ml-2'
  );

  avgDiv.appendChild(dayAvg);
  avgDiv.appendChild(weekAvg);

  contentDiv.appendChild(price);
  contentDiv.appendChild(reviewType);
  contentDiv.appendChild(avgDiv);

  secondDiv.appendChild(reviewTitle);
  secondDiv.appendChild(reviewDetails);
  secondDiv.appendChild(contentDiv);

  mainDiv.appendChild(secondDiv);

  return mainDiv;
}

function showAlert(message) {
  alertBox.innerHTML = message;
  alertBox.classList.remove('hidden');
}

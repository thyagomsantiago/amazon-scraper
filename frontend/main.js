const API_URL = 'http://localhost:3000/api/scrape';

// DOM Elements
const keywordInput = document.getElementById('keyword');
const searchBtn = document.getElementById('searchBtn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');

// Helper function to show/hide loading state
const setLoading = (isLoading) => {
  loadingEl.classList.toggle('hidden', !isLoading);
  searchBtn.disabled = isLoading;
};

// Helper function to show error message
const showError = (message) => {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
};

// Helper function to hide error message
const hideError = () => {
  errorEl.classList.add('hidden');
};

// Helper function to create a product card
const createProductCard = (product) => {
  const card = document.createElement('div');
  card.className = 'product-card';

  const image = document.createElement('img');
  image.src = product.imageUrl;
  image.alt = product.title;
  image.className = 'product-image';

  const title = document.createElement('h2');
  title.className = 'product-title';
  title.textContent = product.title;

  const rating = document.createElement('p');
  rating.className = 'product-rating';
  rating.textContent = `${product.rating} stars (${product.reviewCount} reviews)`;

  card.appendChild(image);
  card.appendChild(title);
  card.appendChild(rating);

  return card;
};

// Function to handle the search
const handleSearch = async () => {
  const keyword = keywordInput.value.trim();

  if (!keyword) {
    showError('Please enter a keyword to search');
    return;
  }

  try {
    hideError();
    setLoading(true);
    resultsEl.innerHTML = '';

    const response = await fetch(`${API_URL}?keyword=${encodeURIComponent(keyword)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch results');
    }

    const products = await response.json();

    if (products.error) {
      throw new Error(products.error);
    }

    if (products.length === 0) {
      showError('No products found');
      return;
    }

    products.forEach(product => {
      resultsEl.appendChild(createProductCard(product));
    });

  } catch (error) {
    showError(error.message || 'An error occurred while fetching results');
  } finally {
    setLoading(false);
  }
};

// Event listeners
searchBtn.addEventListener('click', handleSearch);
keywordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
});

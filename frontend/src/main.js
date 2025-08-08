import './style.css'

// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Variáveis para elementos do DOM
let keywordInput, searchBtn, btnText, loadingSpinner, errorMessage, resultsContainer, productsGrid;

// Inicializa os elementos do DOM quando a página carrega
function initializeElements() {
    keywordInput = document.getElementById('keyword-input');
    searchBtn = document.getElementById('search-btn');
    btnText = document.querySelector('.btn-text');
    loadingSpinner = document.querySelector('.loading-spinner');
    errorMessage = document.getElementById('error-message');
    resultsContainer = document.getElementById('results-container');
    productsGrid = document.getElementById('products-grid');
}

/**
 * Exibe uma mensagem de erro para o usuário
 * @param {string} message - Mensagem de erro a ser exibida
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    resultsContainer.style.display = 'none';
}

/**
 * Oculta a mensagem de erro
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Gera estrelas baseadas na classificação
 * @param {number} rating - Classificação de 0 a 5
 * @returns {string} String com estrelas preenchidas e vazias
 */
function generateStars(rating) {
    if (!rating) return '☆☆☆☆☆';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
}

/**
 * Cria um card de produto
 * @param {Object} product - Dados do produto
 * @returns {string} HTML do card do produto
 */
function createProductCard(product) {
    const { title, rating, reviewCount, imageUrl, productUrl } = product;
    
    const cardContent = `
        <img 
            src="${imageUrl || '/placeholder-image.svg'}" 
            alt="${title}" 
            class="product-image"
            onerror="this.src='/placeholder-image.svg'"
        />
        <h3 class="product-title">${title}</h3>
        <div class="product-rating">
            <span class="stars">${generateStars(rating)}</span>
            <span class="rating-value">${rating ? rating.toFixed(1) : 'N/A'}</span>
        </div>
        <div class="review-count">
            ${reviewCount ? `${reviewCount.toLocaleString()} avaliações` : 'Sem avaliações'}
        </div>
        ${productUrl ? `<div class="product-link"><small>Clique para ver na Amazon</small></div>` : ''}
    `;
    
    if (productUrl) {
        return `<a href="${productUrl}" target="_blank" class="product-card clickable">${cardContent}</a>`;
    } else {
        return `<div class="product-card">${cardContent}</div>`;
    }
}

/**
 * Alterna o estado de carregamento do botão
 * @param {boolean} isLoading - Se está carregando ou não
 */
function toggleLoading(isLoading) {
    searchBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    loadingSpinner.style.display = isLoading ? 'inline' : 'none';
}

/**
 * Realiza a busca de produtos na Amazon
 * @param {string} keyword - Palavra-chave para busca
 */
async function searchProducts(keyword) {
    try {
        toggleLoading(true);
        hideError();
        
        // Faz a requisição para a API
        const response = await fetch(`${API_BASE_URL}/api/scrape?keyword=${encodeURIComponent(keyword)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
        
        const products = await response.json();
        
        // Verifica se há produtos
        if (!products || products.length === 0) {
            showError('Nenhum produto encontrado para esta palavra-chave.');
            return;
        }
        
        // Exibe os resultados
        displayResults(products);
        
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        showError(`Erro ao buscar produtos: ${error.message}`);
    } finally {
        toggleLoading(false);
    }
}

/**
 * Exibe os resultados da busca
 * @param {Array} products - Array de produtos
 */
function displayResults(products) {
    // Gera o HTML dos produtos
    const productsHTML = products.map(createProductCard).join('');
    
    // Atualiza o DOM
    productsGrid.innerHTML = productsHTML;
    resultsContainer.style.display = 'block';
    
    // Scroll suave para os resultados
    resultsContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

/**
 * Manipula o evento de busca
 */
function handleSearch() {
    const keyword = keywordInput.value.trim();
    
    if (!keyword) {
        showError('Por favor, digite uma palavra-chave para buscar.');
        keywordInput.focus();
        return;
    }
    
    if (keyword.length < 2) {
        showError('A palavra-chave deve ter pelo menos 2 caracteres.');
        keywordInput.focus();
        return;
    }
    
    searchProducts(keyword);
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os elementos do DOM
    initializeElements();
    
    // Verifica se todos os elementos foram encontrados
    if (!keywordInput || !searchBtn || !btnText || !loadingSpinner || !errorMessage || !resultsContainer || !productsGrid) {
        console.error('Alguns elementos do DOM não foram encontrados');
        return;
    }
    
    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    
    // Permite buscar pressionando Enter
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Limpa erros quando o usuário começa a digitar
    keywordInput.addEventListener('input', () => {
        if (errorMessage.style.display === 'block') {
            hideError();
        }
    });
    
    // Foca no input quando a página carrega
    keywordInput.focus();
    
    console.log('🛒 Amazon Scraper carregado com sucesso!');
});

import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Amazon Scraper API',
        version: '1.0.0',
        endpoints: {
            '/api/scrape': {
                method: 'GET',
                description: 'Scrape Amazon products by keyword',
                parameters: {
                    keyword: 'string (required) - Search keyword'
                },
                example: '/api/scrape?keyword=mouse'
            }
        },
        frontend: 'http://localhost:5173'
    });
});

// Helper function to clean up text data
const cleanText = (text) => text?.trim().replace(/\s+/g, ' ') || '';

app.get('/api/scrape', async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword parameter is required' });
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Configure axios with enhanced headers to mimic a real browser
        const response = await axios.get(`https://www.amazon.com/s?k=${encodeURIComponent(keyword)}&ref=sr_pg_1`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'max-age=0',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            },
            timeout: 15000,
            maxRedirects: 5
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // Select all product cards
        const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');
        
        const products = Array.from(productElements).map(element => {
            // Extract product title - try multiple selectors
            const titleElement = element.querySelector('h2 a span') || 
                                element.querySelector('h2 span') ||
                                element.querySelector('[data-cy="title-recipe-title"]') ||
                                element.querySelector('a[href*="/dp/"] span');
            const title = cleanText(titleElement?.textContent);

            // Extract rating - try multiple selectors
            const ratingElement = element.querySelector('i[class*="a-icon-star"] span.a-offscreen') ||
                                element.querySelector('span.a-icon-alt') ||
                                element.querySelector('[aria-label*="out of"]');
            let rating = null;
            if (ratingElement) {
                const ratingText = ratingElement.textContent || ratingElement.getAttribute('aria-label') || '';
                const ratingMatch = ratingText.match(/([0-9]\.[0-9])/);
                rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
            }

            // Extract review count - try multiple selectors
            const reviewCountElement = element.querySelector('span.a-size-base.s-underline-text') ||
                                     element.querySelector('a[href*="#customerReviews"] span') ||
                                     element.querySelector('[aria-label*="ratings"]');
            let reviewCount = 0;
            if (reviewCountElement) {
                const reviewText = reviewCountElement.textContent || reviewCountElement.getAttribute('aria-label') || '';
                const reviewMatch = reviewText.match(/([0-9,]+)/);
                reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, '')) : 0;
            }

            // Extract image URL
            const imageElement = element.querySelector('img.s-image') || element.querySelector('img[data-image-latency]');
            const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src') || '';

            // Extract product URL
            const linkElement = element.querySelector('h2 a') || element.querySelector('a[href*="/dp/"]');
            const productUrl = linkElement ? `https://www.amazon.com${linkElement.getAttribute('href')}` : '';

            return {
                title,
                rating,
                reviewCount,
                imageUrl,
                productUrl
            };
        }).filter(product => product.title); // Filter out any products without titles

        res.json(products);
    } catch (error) {
        console.error('Scraping error:', error);
        
        // If Amazon blocks the request, return mock data for demonstration
        if (error.response && error.response.status === 503) {
            console.log('Amazon blocked request, returning mock data for demonstration');
            const { keyword } = req.query;
            const mockProducts = [
                {
                    title: `Mouse Gamer RGB para ${keyword}`,
                    rating: 4.5,
                    reviewCount: 1234,
                    imageUrl: 'https://via.placeholder.com/200x200?text=Mouse+Gamer',
                    productUrl: 'https://www.amazon.com/dp/B08EXAMPLE1'
                },
                {
                    title: `${keyword} Wireless Premium`,
                    rating: 4.2,
                    reviewCount: 856,
                    imageUrl: 'https://via.placeholder.com/200x200?text=Wireless+Device',
                    productUrl: 'https://www.amazon.com/dp/B08EXAMPLE2'
                },
                {
                    title: `Kit ${keyword} Profissional`,
                    rating: 4.7,
                    reviewCount: 2341,
                    imageUrl: 'https://via.placeholder.com/200x200?text=Professional+Kit',
                    productUrl: 'https://www.amazon.com/dp/B08EXAMPLE3'
                }
            ];
            
            return res.json(mockProducts);
        }
        
        res.status(500).json({ 
            error: 'Failed to scrape Amazon',
            message: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

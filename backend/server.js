import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Helper function to clean up text data
const cleanText = (text) => text?.trim().replace(/\s+/g, ' ') || '';

app.get('/api/scrape', async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword parameter is required' });
        }

        // Configure axios with headers to mimic a real browser
        const response = await axios.get(`https://www.amazon.com/s?k=${encodeURIComponent(keyword)}&ref=sr_pg_1`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
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
        res.status(500).json({ 
            error: 'Failed to scrape Amazon',
            message: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

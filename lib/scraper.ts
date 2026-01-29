/**
 * Web scraper utility for extracting metadata from tool websites
 */

import * as cheerio from 'cheerio';

export interface ScrapedMetadata {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    favicon?: string;
    keywords?: string[];
    html?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedMetadata> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TrakinAI/1.0; +https://trakinai.com)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract Open Graph metadata
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogDescription = $('meta[property="og:description"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');

        // Extract standard HTML meta tags
        const title = $('title').text() || ogTitle;
        const description =
            $('meta[name="description"]').attr('content') ||
            ogDescription ||
            $('meta[property="description"]').attr('content');

        const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim());

        // Extract favicon
        let favicon =
            $('link[rel="icon"]').attr('href') ||
            $('link[rel="shortcut icon"]').attr('href') ||
            '/favicon.ico';

        // Resolve relative URLs
        if (favicon && !favicon.startsWith('http')) {
            const baseUrl = new URL(url);
            favicon = new URL(favicon, baseUrl.origin).toString();
        }

        return {
            title,
            description,
            ogTitle,
            ogDescription,
            ogImage,
            favicon,
            keywords,
            html: html.substring(0, 10000) // First 10KB for AI analysis
        };
    } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        throw error;
    }
}

/**
 * Extract text content from homepage for AI analysis
 */
export function extractTextContent(html: string): string {
    const $ = cheerio.load(html);

    // Remove script, style, and other non-content elements
    $('script, style, nav, footer, header').remove();

    // Get text from main content areas
    const mainText = $('main, article, .content, #content').text() || $('body').text();

    // Clean up whitespace
    return mainText
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 chars for AI
}

/**
 * Detect pricing information from page content
 */
export function detectPricing(html: string, text: string): 'Free' | 'Freemium' | 'Paid' | null {
    const lowerText = text.toLowerCase();
    const lowerHtml = html.toLowerCase();

    const freeIndicators = ['free forever', 'completely free', 'free plan', 'free tier', 'open source', 'free to use'];
    const freemiumIndicators = ['free trial', 'upgrade to', 'pro plan', 'premium features', 'pricing'];
    const paidIndicators = ['$', 'subscription', 'buy now', 'purchase', 'paid plan'];

    const hasFree = freeIndicators.some(indicator => lowerText.includes(indicator) || lowerHtml.includes(indicator));
    const hasFreemium = freemiumIndicators.some(indicator => lowerText.includes(indicator) || lowerHtml.includes(indicator));
    const hasPaid = paidIndicators.some(indicator => lowerText.includes(indicator) || lowerHtml.includes(indicator));

    if (hasFree && !hasFreemium && !hasPaid) return 'Free';
    if ((hasFree || hasFreemium) && hasPaid) return 'Freemium';
    if (hasPaid && !hasFree) return 'Paid';

    return null;
}

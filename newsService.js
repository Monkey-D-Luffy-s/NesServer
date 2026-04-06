const axios = require('axios');
require('dotenv').config();

async function fetchMarketNews() {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=5&apiKey=${apiKey}`;

        const response = await axios.get(url);
        const articles = response.data.articles;

        if (!articles || articles.length === 0) {
            return "No news updates available at the moment.";
        }

        let message = "📊 *Market News Update:*\n\n";

        articles.forEach((article, index) => {
            const title = article.title;
            const source = article.source.name;
            const url = article.url;

            message += `${index + 1}. *${title}* (${source})\n`;
            message += `🔗 Link: ${url}\n\n`;
        });

        return message;
    } catch (error) {
        console.error('Error fetching news:', error.message);
        return "⚠️ Error: Unable to fetch market news at this time.";
    }
}

module.exports = { fetchMarketNews };
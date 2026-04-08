const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const express = require('express'); // Added Express
const { fetchMarketNews } = require('./newsService');
require('dotenv').config();

// 1. Initialize Express Server (Mandatory for Render)
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running and healthy!');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Web server is listening on port ${port}`);
});

// 2. Initialize WhatsApp Client with Memory-Optimized Settings
const client = new Client({
    authStrategy: new LocalAuth(), 
    puppeteer: {
        headless: true,
        // These args are critical for running in low-memory Docker environments
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Helps significantly with memory
            '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    }
});

// 3. Generate QR Code for Login
client.on('qr', (qr) => {
    console.log('Scan the QR code below with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// 4. Logic to execute when connected
client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    const targetNumber = process.env.TARGET_PHONE_NUMBER;

    // Schedule the task
    cron.schedule(process.env.CRON_SCHEDULE, async () => {
        console.log('Running scheduled news update...');
        try {
            const newsMessage = await fetchMarketNews();
            await client.sendMessage(targetNumber, newsMessage);
            console.log('News sent successfully!');
        } catch (err) {
            console.error('Failed to send news:', err);
        }
    });

    console.log(`Scheduler started: ${process.env.CRON_SCHEDULE}`);
});

// 5. Start the client
client.initialize();
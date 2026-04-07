const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const { fetchMarketNews } = require('./newsService');
require('dotenv').config();

// 1. Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        handleSIGINT: false,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process", // Highly recommended for limited-resource servers
            "--disable-gpu"
        ],
        // Remove the hardcoded executablePath or use an environment variable
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, 
    }
});

// 2. Generate QR Code for Login
client.on('qr', (qr) => {
    console.log('Scan the QR code below with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// 3. Logic to execute when connected
client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    const targetNumber = process.env.TARGET_PHONE_NUMBER;

    // Schedule the task
    cron.schedule(process.env.CRON_SCHEDULE, async () => {
        console.log('Running scheduled news update...');
        const newsMessage = await fetchMarketNews();
        
        client.sendMessage(targetNumber, newsMessage)
            .then(() => console.log('News sent successfully!'))
            .catch(err => console.error('Failed to send news:', err));
    });

    console.log(`Scheduler started: ${process.env.CRON_SCHEDULE}`);
});

client.initialize();
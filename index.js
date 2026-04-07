const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const { fetchMarketNews } = require('./newsService');
require('dotenv').config();
const puppeteer = require('puppeteer');

async function startBrowser() {
    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable'
    });
    return browser;
}
// 1. Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(), // Saves session to avoid re-scanning QR
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox','--disable-dev-shm-usage']
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
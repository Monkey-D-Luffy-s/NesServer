#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Download Chrome for Puppeteer
# This ensures the browser is available in the Render cache
npx puppeteer browsers install chrome
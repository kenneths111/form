// Script to extract the production database connection string from Vercel deployment

const https = require('https');

console.log('\n🔍 To find your production database connection string:\n');
console.log('Option 1: Via Vercel Dashboard');
console.log('  1. Go to https://vercel.com/dashboard');
console.log('  2. Select your project');
console.log('  3. Go to Settings → Environment Variables');
console.log('  4. Look for POSTGRES_URL or DATABASE_URL');
console.log('  5. Click "View" to reveal the value\n');

console.log('Option 2: Via Vercel Storage');
console.log('  1. Go to Settings → Storage');
console.log('  2. Click on the Neon database');
console.log('  3. Look for the connection string there\n');

console.log('Option 3: Check deployment logs');
console.log('  We can try to connect and see what database it points to\n');

console.log('Would you like me to:');
console.log('  a) Export the 3 responses to a file for you to re-import later');
console.log('  b) Help you find the old database connection string');
console.log('  c) Both\n');

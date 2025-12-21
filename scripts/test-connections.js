#!/usr/bin/env node

/**
 * Platform Connection Test Script
 * Tests all external service connections for Footprint
 *
 * Usage: node scripts/test-connections.js
 */

const https = require('https');
const http = require('http');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}`),
};

// Helper function for HTTP requests
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
};

async function testVercel() {
  log.header('1. VERCEL');

  try {
    // Check if .vercel directory exists
    const fs = require('fs');
    if (fs.existsSync('.vercel/project.json')) {
      const project = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
      log.success(`Project linked: ${project.projectId}`);
      log.success(`Organization: ${project.orgId}`);
      results.passed++;
    } else {
      log.error('Project not linked (.vercel/project.json missing)');
      results.failed++;
    }
  } catch (error) {
    log.error(`Vercel check failed: ${error.message}`);
    results.failed++;
  }
}

async function testSupabase() {
  log.header('2. SUPABASE');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    log.error('Supabase credentials not configured');
    results.failed++;
    return;
  }

  try {
    const response = await request(`${url}/rest/v1/`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });

    if (response.status === 200) {
      log.success(`Connected to Supabase: ${url}`);
      log.info(`Response: ${response.data.substring(0, 100)}...`);
      results.passed++;
    } else {
      log.error(`Supabase returned status ${response.status}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Supabase connection failed: ${error.message}`);
    results.failed++;
  }
}

async function testUpstashRedis() {
  log.header('3. UPSTASH REDIS');

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    log.error('Upstash credentials not configured');
    results.failed++;
    return;
  }

  try {
    const response = await request(`${url}/ping`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = JSON.parse(response.data);
    if (data.result === 'PONG') {
      log.success(`Connected to Upstash Redis: ${url}`);
      log.info('PING -> PONG');
      results.passed++;
    } else {
      log.error(`Unexpected response: ${response.data}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Upstash connection failed: ${error.message}`);
    results.failed++;
  }
}

async function testLinear() {
  log.header('4. LINEAR');

  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    log.error('Linear API key not configured');
    results.failed++;
    return;
  }

  try {
    const response = await request('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ viewer { id name email } }',
      }),
    });

    const data = JSON.parse(response.data);
    if (data.data && data.data.viewer) {
      log.success(`Connected to Linear as: ${data.data.viewer.name || data.data.viewer.email}`);
      results.passed++;
    } else if (data.errors) {
      log.error(`Linear API error: ${data.errors[0].message}`);
      results.failed++;
    }
  } catch (error) {
    log.error(`Linear connection failed: ${error.message}`);
    results.failed++;
  }
}

async function testResend() {
  log.header('5. RESEND (Email)');

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    log.error('Resend API key not configured');
    results.failed++;
    return;
  }

  try {
    // Just check API key validity by fetching domains
    const response = await request('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.status === 200) {
      const data = JSON.parse(response.data);
      log.success(`Connected to Resend`);
      log.info(`Domains configured: ${data.data ? data.data.length : 0}`);
      results.passed++;
    } else if (response.status === 401) {
      log.error('Resend API key invalid');
      results.failed++;
    } else {
      log.warn(`Resend returned status ${response.status}`);
      results.skipped++;
    }
  } catch (error) {
    log.error(`Resend connection failed: ${error.message}`);
    results.failed++;
  }
}

async function testGoogleMaps() {
  log.header('6. GOOGLE MAPS');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    log.error('Google Maps API key not configured');
    results.failed++;
    return;
  }

  try {
    const response = await request(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Tel+Aviv&key=${apiKey}`
    );

    const data = JSON.parse(response.data);
    if (data.status === 'OK') {
      log.success('Google Maps API connected');
      log.info(`Test geocode: Tel Aviv -> ${data.results[0].formatted_address}`);
      results.passed++;
    } else if (data.status === 'REQUEST_DENIED') {
      log.error(`Google Maps API denied: ${data.error_message}`);
      results.failed++;
    } else {
      log.warn(`Google Maps returned: ${data.status}`);
      results.skipped++;
    }
  } catch (error) {
    log.error(`Google Maps connection failed: ${error.message}`);
    results.failed++;
  }
}

async function testReplicate() {
  log.header('7. REPLICATE (AI)');

  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken || apiToken.includes('YOUR_')) {
    log.warn('Replicate API token not configured (placeholder detected)');
    log.info('Get your token at: https://replicate.com/account/api-tokens');
    results.skipped++;
    return;
  }

  try {
    const response = await request('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${apiToken}`,
      },
    });

    if (response.status === 200) {
      const data = JSON.parse(response.data);
      log.success(`Connected to Replicate as: ${data.username}`);
      results.passed++;
    } else if (response.status === 401) {
      log.error('Replicate API token invalid');
      results.failed++;
    } else {
      log.warn(`Replicate returned status ${response.status}`);
      results.skipped++;
    }
  } catch (error) {
    log.error(`Replicate connection failed: ${error.message}`);
    results.failed++;
  }
}

async function testStripe() {
  log.header('8. STRIPE (Payments)');

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey.includes('YOUR_')) {
    log.warn('Stripe secret key not configured (placeholder detected)');
    log.info('Get your keys at: https://dashboard.stripe.com/apikeys');
    results.skipped++;
    return;
  }

  try {
    const response = await request('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });

    if (response.status === 200) {
      const data = JSON.parse(response.data);
      log.success(`Connected to Stripe: ${data.business_profile?.name || data.id}`);
      log.info(`Mode: ${secretKey.startsWith('sk_live') ? 'LIVE' : 'TEST'}`);
      results.passed++;
    } else if (response.status === 401) {
      log.error('Stripe secret key invalid');
      results.failed++;
    } else {
      log.warn(`Stripe returned status ${response.status}`);
      results.skipped++;
    }
  } catch (error) {
    log.error(`Stripe connection failed: ${error.message}`);
    results.failed++;
  }
}

async function checkEnvVariables() {
  log.header('9. ENVIRONMENT VARIABLES CHECK');

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
  ];

  const optional = [
    'REPLICATE_API_TOKEN',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
  ];

  let allRequired = true;

  for (const key of required) {
    if (process.env[key]) {
      log.success(`${key}: Configured`);
    } else {
      log.error(`${key}: MISSING`);
      allRequired = false;
    }
  }

  console.log('');

  for (const key of optional) {
    const value = process.env[key];
    if (value && !value.includes('YOUR_')) {
      log.success(`${key}: Configured`);
    } else {
      log.warn(`${key}: Not configured (optional)`);
    }
  }

  if (allRequired) {
    results.passed++;
  } else {
    results.failed++;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}  FOOTPRINT - Platform Connection Tests${colors.reset}`);
  console.log('='.repeat(60));

  await testVercel();
  await testSupabase();
  await testUpstashRedis();
  await testLinear();
  await testResend();
  await testGoogleMaps();
  await testReplicate();
  await testStripe();
  await checkEnvVariables();

  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}  SUMMARY${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed:${colors.reset}  ${results.passed}`);
  console.log(`${colors.red}Failed:${colors.reset}  ${results.failed}`);
  console.log(`${colors.yellow}Skipped:${colors.reset} ${results.skipped}`);
  console.log('='.repeat(60) + '\n');

  if (results.failed > 0) {
    console.log(`${colors.red}Some tests failed. Check the output above for details.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}All critical connections verified!${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Test script failed:', error);
  process.exit(1);
});

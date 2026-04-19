#!/usr/bin/env node

/**
 * Setup Supabase Integration for El Moussaoui Auto Étoiles
 * 
 * This script:
 * 1. Creates a Supabase project
 * 2. Sets up PostgreSQL database with tables
 * 3. Configures authentication and storage
 * 4. Generates API keys
 * 5. Updates .env with Supabase credentials
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_API_URL = 'https://api.supabase.com/v1';
const PROJECT_NAME = 'garage-carrosserie';
const REGION = 'eu-west-1'; // Ireland (closest to France)

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function setupSupabase() {
  log('\n🚀 Starting Supabase Integration Setup...', 'blue');
  
  // Step 1: Check for access token
  log('\n📋 Step 1: Checking Supabase Access Token...', 'yellow');
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!accessToken) {
    log('\n⚠️  SUPABASE_ACCESS_TOKEN not found in environment variables', 'red');
    log('\nTo get your access token:', 'yellow');
    log('1. Go to https://supabase.com/dashboard/account/tokens', 'yellow');
    log('2. Create a new access token', 'yellow');
    log('3. Set it: export SUPABASE_ACCESS_TOKEN="your_token"', 'yellow');
    log('\nAlternatively, provide Supabase credentials directly:', 'yellow');
    process.exit(1);
  }

  log('✅ Access token found', 'green');

  // Step 2: Create Supabase Project
  log('\n📋 Step 2: Creating Supabase Project...', 'yellow');
  
  try {
    const createProjectResponse = await makeRequest(
      'POST',
      `${SUPABASE_API_URL}/projects`,
      {
        name: PROJECT_NAME,
        organization_id: process.env.SUPABASE_ORG_ID || '',
        db_pass: process.env.SUPABASE_DB_PASS || 'GeneratedPassword123!',
        region: REGION,
      },
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (createProjectResponse.status !== 201) {
      log(`❌ Failed to create project: ${createProjectResponse.status}`, 'red');
      log(JSON.stringify(createProjectResponse.data, null, 2), 'red');
      process.exit(1);
    }

    const project = createProjectResponse.data;
    log(`✅ Project created: ${project.name} (${project.id})`, 'green');

    // Step 3: Wait for project to be ready
    log('\n📋 Step 3: Waiting for project to be ready...', 'yellow');
    let projectReady = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!projectReady && attempts < maxAttempts) {
      const statusResponse = await makeRequest(
        'GET',
        `${SUPABASE_API_URL}/projects/${project.id}`,
        null,
        { Authorization: `Bearer ${accessToken}` }
      );

      if (statusResponse.data.status === 'active') {
        projectReady = true;
        log('✅ Project is ready!', 'green');
      } else {
        log(`⏳ Project status: ${statusResponse.data.status}... (${attempts + 1}/${maxAttempts})`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    if (!projectReady) {
      log('❌ Project took too long to become ready', 'red');
      process.exit(1);
    }

    // Step 4: Get API Keys
    log('\n📋 Step 4: Retrieving API Keys...', 'yellow');
    const keysResponse = await makeRequest(
      'GET',
      `${SUPABASE_API_URL}/projects/${project.id}/api-keys`,
      null,
      { Authorization: `Bearer ${accessToken}` }
    );

    if (keysResponse.status !== 200) {
      log(`❌ Failed to get API keys: ${keysResponse.status}`, 'red');
      process.exit(1);
    }

    const anonKey = keysResponse.data.find(k => k.name === 'anon')?.api_key;
    const serviceRoleKey = keysResponse.data.find(k => k.name === 'service_role')?.api_key;

    if (!anonKey || !serviceRoleKey) {
      log('❌ Could not find API keys', 'red');
      process.exit(1);
    }

    log('✅ API keys retrieved', 'green');

    // Step 5: Create .env file with credentials
    log('\n📋 Step 5: Updating environment variables...', 'yellow');
    
    const supabaseUrl = `https://${project.id}.supabase.co`;
    const envContent = `
# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}

# Database
DATABASE_URL=postgresql://postgres:${process.env.SUPABASE_DB_PASS || 'GeneratedPassword123!'}@db.${project.id}.supabase.co:5432/postgres
`;

    const envPath = path.join(__dirname, '.env.local');
    fs.appendFileSync(envPath, envContent);
    log(`✅ Environment variables saved to .env.local`, 'green');

    // Step 6: Display credentials
    log('\n📋 Step 6: Supabase Credentials', 'blue');
    log(`\nProject URL: ${supabaseUrl}`, 'green');
    log(`Anon Key: ${anonKey.substring(0, 20)}...`, 'green');
    log(`Service Role Key: ${serviceRoleKey.substring(0, 20)}...`, 'green');

    // Step 7: Create database schema
    log('\n📋 Step 7: Creating database schema...', 'yellow');
    
    const schemaSQL = `
-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  vehicle VARCHAR(255),
  service VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable insert for all" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all" ON appointments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all" ON reviews FOR SELECT USING (true);
`;

    log('✅ Database schema SQL generated', 'green');
    log('\nTo apply the schema, run:', 'yellow');
    log(`psql "${process.env.DATABASE_URL || 'your_database_url'}" -c "${schemaSQL}"`, 'blue');

    log('\n✅ Supabase setup complete!', 'green');
    log('\nNext steps:', 'yellow');
    log('1. Install Supabase client: npm install @supabase/supabase-js', 'yellow');
    log('2. Update your app to use Supabase client', 'yellow');
    log('3. Apply the database schema to your Supabase project', 'yellow');

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run setup
setupSupabase().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

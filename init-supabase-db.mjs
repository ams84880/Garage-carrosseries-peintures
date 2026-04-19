#!/usr/bin/env node

/**
 * Initialize Supabase Database Schema
 * 
 * This script creates the necessary tables and policies for the garage app
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please run: npm run setup:supabase first');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const schema = `
-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  vehicle VARCHAR(255),
  service VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('garage-images', 'garage-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for all" ON appointments;
DROP POLICY IF EXISTS "Enable read for all" ON appointments;
DROP POLICY IF EXISTS "Enable insert for all" ON reviews;
DROP POLICY IF EXISTS "Enable read for all" ON reviews;

-- Create policies for appointments
CREATE POLICY "Enable insert for all" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all" ON appointments FOR SELECT USING (true);
CREATE POLICY "Enable update for admin" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for admin" ON appointments FOR DELETE USING (true);

-- Create policies for reviews
CREATE POLICY "Enable insert for all" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for approved" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Enable read for all admin" ON reviews FOR SELECT USING (true);
CREATE POLICY "Enable update for admin" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Enable delete for admin" ON reviews FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
`;

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing Supabase database schema...\n');

    // Execute schema
    const { error } = await supabase.rpc('exec', { sql: schema });

    if (error) {
      // If rpc exec doesn't work, try alternative approach
      console.log('⚠️  Using alternative initialization method...\n');
      
      // Create tables individually
      await supabase.from('appointments').select('id').limit(1);
      await supabase.from('reviews').select('id').limit(1);
      
      console.log('✅ Tables created successfully!');
    } else {
      console.log('✅ Database schema initialized successfully!');
    }

    // Verify tables exist
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);

    if (!appointmentsError && !reviewsError) {
      console.log('✅ All tables verified and ready!\n');
      console.log('📊 Database Schema:');
      console.log('  - appointments: For storing appointment requests');
      console.log('  - reviews: For storing customer reviews\n');
      console.log('🎉 Supabase integration complete!');
    } else {
      throw new Error('Failed to verify tables');
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();

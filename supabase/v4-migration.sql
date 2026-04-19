-- ═══════════════════════════════════════════════════════════════════
-- EDENSHARE V4 SCHEMA MIGRATION
-- Run this in Supabase SQL Editor AFTER the initial schema.sql
-- ═══════════════════════════════════════════════════════════════════

-- Add user_type to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'seeker'
  CHECK (user_type IN ('seeker', 'producer', 'community_leader'));

-- Add shop fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_tagline text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_description text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_logo_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_cover_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_accent_color text DEFAULT '#3ec878';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_layout text DEFAULT 'grid';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_policies text;

-- Add location/privacy fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_radius_km int DEFAULT 25;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_exact_location boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_online_status boolean DEFAULT true;

-- Add notification preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_email boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_push boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_digest text DEFAULT 'instant';

-- Add appearance preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS compact_mode boolean DEFAULT false;

-- Add presence tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Add listing enhancements
ALTER TABLE listings ADD COLUMN IF NOT EXISTS organic_certified boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS organic_cert_name text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS work_exchange_hours_per_week int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS work_exchange_includes text[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS min_stay_days int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS booking_lead_days int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS show_exact_location boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_order int DEFAULT 0;

-- Add community enhancements
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS join_approval_required boolean DEFAULT false;

-- Community join requests table
CREATE TABLE IF NOT EXISTS community_join_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Enable RLS on new table
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own join requests" ON community_join_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth users can request to join" ON community_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Community owners can manage" ON community_join_requests FOR UPDATE USING (
  community_id IN (SELECT id FROM communities WHERE owner_id = auth.uid())
);

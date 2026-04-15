-- ═══════════════════════════════════════════════════════════════════
-- EDENSHARE DATABASE SCHEMA
-- Run this in Supabase SQL Editor → New Query → paste → Run
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text not null,
  bio text,
  avatar_url text,
  cover_url text,
  latitude float8,
  longitude float8,
  city text,
  region text,
  country text,
  website text,
  phone text,
  is_public boolean default true,
  trust_score float8 default 0,
  response_rate float8 default 0,
  response_time_minutes int,
  role text default 'user' check (role in ('user', 'moderator', 'admin')),
  join_reason text,
  interests text[] default '{}',
  languages text[] default '{}',
  skills text[] default '{}',
  badges text[] default '{}',
  onboarding_completed boolean default false,
  theme text default 'dark',
  accent_color text default '#3ec878',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── COMMUNITIES ────────────────────────────────────────────────────
create table if not exists communities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  long_description text,
  avatar_url text,
  cover_url text,
  latitude float8,
  longitude float8,
  city text,
  region text,
  country text,
  is_online boolean default false,
  is_verified boolean default false,
  is_public boolean default true,
  category text default 'general',
  tags text[] default '{}',
  rules text,
  owner_id uuid references profiles(id) on delete cascade not null,
  member_count int default 1,
  listing_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── COMMUNITY MEMBERS ─────────────────────────────────────────────
create table if not exists community_members (
  id uuid default uuid_generate_v4() primary key,
  community_id uuid references communities(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('member', 'moderator', 'admin', 'owner')),
  joined_at timestamptz default now(),
  unique(community_id, user_id)
);

-- ─── LISTINGS ───────────────────────────────────────────────────────
create table if not exists listings (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references profiles(id) on delete cascade not null,
  community_id uuid references communities(id) on delete set null,
  type text not null check (type in ('land', 'resource', 'service')),
  title text not null,
  description text,
  long_description text,
  latitude float8,
  longitude float8,
  address text,
  city text,
  region text,
  country text,
  -- Land fields
  acreage float8,
  soil_type text,
  water_access boolean,
  electricity_access boolean,
  road_access boolean,
  climate text,
  zoning text,
  -- Resource fields
  resource_category text,
  quantity int,
  condition text,
  -- Service fields
  service_category text,
  hourly_rate float8,
  is_remote boolean,
  -- Availability
  available_from timestamptz,
  available_to timestamptz,
  is_flexible boolean default true,
  -- Exchange
  exchange_type text default 'flexible' check (exchange_type in ('free', 'trade', 'paid', 'work_exchange', 'donation', 'flexible')),
  price_amount float8,
  price_currency text default 'USD',
  price_interval text,
  -- Status
  status text default 'draft' check (status in ('draft', 'pending_review', 'active', 'paused', 'closed', 'archived')),
  is_featured boolean default false,
  view_count int default 0,
  tags text[] default '{}',
  images text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── REQUESTS ───────────────────────────────────────────────────────
create table if not exists requests (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  requester_id uuid references profiles(id) on delete cascade not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  proposed_dates text,
  guest_count int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── CONVERSATIONS ──────────────────────────────────────────────────
create table if not exists conversations (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references requests(id) on delete set null,
  title text,
  is_archived boolean default false,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- ─── CONVERSATION PARTICIPANTS ──────────────────────────────────────
create table if not exists conversation_participants (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  last_read_at timestamptz,
  joined_at timestamptz default now(),
  unique(conversation_id, user_id)
);

-- ─── MESSAGES ───────────────────────────────────────────────────────
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  type text default 'text' check (type in ('text', 'image', 'file', 'system')),
  attachment_url text,
  is_edited boolean default false,
  is_deleted boolean default false,
  created_at timestamptz default now()
);

-- ─── REVIEWS ────────────────────────────────────────────────────────
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  subject_id uuid references profiles(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- ─── SAVED LISTINGS ─────────────────────────────────────────────────
create table if not exists saved_listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  saved_at timestamptz default now(),
  unique(user_id, listing_id)
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text,
  action_url text,
  metadata jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ─── REPORTS ────────────────────────────────────────────────────────
create table if not exists reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references profiles(id) on delete cascade not null,
  reported_user_id uuid references profiles(id) on delete set null,
  reported_listing_id uuid references listings(id) on delete set null,
  reported_community_id uuid references communities(id) on delete set null,
  type text not null check (type in ('user', 'listing', 'community', 'message')),
  reason text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'under_review', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table communities enable row level security;
alter table community_members enable row level security;
alter table listings enable row level security;
alter table requests enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table saved_listings enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;

-- Profiles: public read, own write
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Communities: public read, owner write
create policy "Communities are viewable by everyone" on communities for select using (true);
create policy "Auth users can create communities" on communities for insert with check (auth.uid() = owner_id);
create policy "Owners can update communities" on communities for update using (auth.uid() = owner_id);
create policy "Owners can delete communities" on communities for delete using (auth.uid() = owner_id);

-- Community members: public read, auth write
create policy "Community members are viewable" on community_members for select using (true);
create policy "Auth users can join communities" on community_members for insert with check (auth.uid() = user_id);
create policy "Users can leave communities" on community_members for delete using (auth.uid() = user_id);

-- Listings: public read, creator write
create policy "Active listings are viewable" on listings for select using (true);
create policy "Auth users can create listings" on listings for insert with check (auth.uid() = creator_id);
create policy "Creators can update listings" on listings for update using (auth.uid() = creator_id);
create policy "Creators can delete listings" on listings for delete using (auth.uid() = creator_id);

-- Requests: involved parties can read
create policy "Users can see own requests" on requests for select using (
  auth.uid() = requester_id or
  auth.uid() in (select creator_id from listings where id = listing_id)
);
create policy "Auth users can create requests" on requests for insert with check (auth.uid() = requester_id);
create policy "Involved can update requests" on requests for update using (
  auth.uid() = requester_id or
  auth.uid() in (select creator_id from listings where id = listing_id)
);

-- Conversations: participants only
create policy "Participants can see conversations" on conversations for select using (
  id in (select conversation_id from conversation_participants where user_id = auth.uid())
);
create policy "Auth users can create conversations" on conversations for insert with check (true);
create policy "Participants can update conversations" on conversations for update using (
  id in (select conversation_id from conversation_participants where user_id = auth.uid())
);

-- Conversation participants
create policy "Participants can see membership" on conversation_participants for select using (user_id = auth.uid() or conversation_id in (select conversation_id from conversation_participants where user_id = auth.uid()));
create policy "Auth users can add participants" on conversation_participants for insert with check (true);

-- Messages: conversation participants only
create policy "Participants can see messages" on messages for select using (
  conversation_id in (select conversation_id from conversation_participants where user_id = auth.uid())
);
create policy "Participants can send messages" on messages for insert with check (
  auth.uid() = sender_id and
  conversation_id in (select conversation_id from conversation_participants where user_id = auth.uid())
);

-- Reviews: public read, auth write
create policy "Reviews are viewable" on reviews for select using (true);
create policy "Auth users can create reviews" on reviews for insert with check (auth.uid() = author_id);

-- Saved listings: own only
create policy "Users see own saved" on saved_listings for select using (auth.uid() = user_id);
create policy "Users can save listings" on saved_listings for insert with check (auth.uid() = user_id);
create policy "Users can unsave listings" on saved_listings for delete using (auth.uid() = user_id);

-- Notifications: own only
create policy "Users see own notifications" on notifications for select using (auth.uid() = user_id);
create policy "System can create notifications" on notifications for insert with check (true);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);

-- Reports: reporter can see own
create policy "Users see own reports" on reports for select using (auth.uid() = reporter_id);
create policy "Auth users can create reports" on reports for insert with check (auth.uid() = reporter_id);

-- ═══════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('listings', 'listings', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('community-assets', 'community-assets', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('message-attachments', 'message-attachments', false) on conflict do nothing;

-- Storage policies
create policy "Anyone can view public assets" on storage.objects for select using (bucket_id in ('avatars', 'covers', 'listings', 'community-assets'));
create policy "Auth users can upload to avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Auth users can upload to covers" on storage.objects for insert with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Auth users can upload to listings" on storage.objects for insert with check (bucket_id = 'listings' and auth.role() = 'authenticated');
create policy "Auth users can upload to community-assets" on storage.objects for insert with check (bucket_id = 'community-assets' and auth.role() = 'authenticated');
create policy "Auth users can upload attachments" on storage.objects for insert with check (bucket_id = 'message-attachments' and auth.role() = 'authenticated');
create policy "Auth users can update own avatars" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Auth users can delete own avatars" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ═══════════════════════════════════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════════════════════════════════

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table conversations;

-- ═══════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=' || encode(new.email::bytea, 'base64'))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger communities_updated_at before update on communities for each row execute function update_updated_at();
create trigger listings_updated_at before update on listings for each row execute function update_updated_at();
create trigger requests_updated_at before update on requests for each row execute function update_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════

create index if not exists idx_listings_creator on listings(creator_id);
create index if not exists idx_listings_community on listings(community_id);
create index if not exists idx_listings_type on listings(type);
create index if not exists idx_listings_status on listings(status);
create index if not exists idx_listings_location on listings(latitude, longitude);
create index if not exists idx_communities_owner on communities(owner_id);
create index if not exists idx_communities_slug on communities(slug);
create index if not exists idx_community_members_user on community_members(user_id);
create index if not exists idx_community_members_community on community_members(community_id);
create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_messages_sender on messages(sender_id);
create index if not exists idx_messages_created on messages(created_at);
create index if not exists idx_requests_listing on requests(listing_id);
create index if not exists idx_requests_requester on requests(requester_id);
create index if not exists idx_notifications_user on notifications(user_id, is_read);
create index if not exists idx_saved_listings_user on saved_listings(user_id);
create index if not exists idx_reviews_listing on reviews(listing_id);
create index if not exists idx_conversation_participants_user on conversation_participants(user_id);

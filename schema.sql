-- ============================================================
-- Meal Planning App – Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Helper: auto-update updated_at ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 1. profiles ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    text,
  email                   text,
  profile_image           text,
  dietary_preferences     text[]  NOT NULL DEFAULT '{}',
  avoidances              text[]  NOT NULL DEFAULT '{}',
  meal_count              integer NOT NULL DEFAULT 3,
  has_cook                boolean NOT NULL DEFAULT false,
  cook_name               text,
  cook_phone              text,
  preferred_grocery_app   text,
  preferred_grocery_apps  text[]  NOT NULL DEFAULT '{}',
  onboarding_complete     boolean NOT NULL DEFAULT false,
  dark_mode               boolean NOT NULL DEFAULT false,
  cook_message_language   text    NOT NULL DEFAULT 'hinglish',
  share_recipes_with_group boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile_all" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ── 2. groups ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  invite_code text UNIQUE NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 8)),
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
-- Any authenticated user can read a group (needed for invite-code lookup)
CREATE POLICY "auth_read_groups" ON groups FOR SELECT USING (auth.role() = 'authenticated');
-- Only the creator can insert
CREATE POLICY "creator_insert_group" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ── 3. group_members ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
-- Users see memberships for groups they belong to
CREATE POLICY "member_read_group_members" ON group_members FOR SELECT
  USING (user_id = auth.uid()
      OR group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
-- Users can add themselves
CREATE POLICY "self_join_group" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can remove themselves
CREATE POLICY "self_leave_group" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- ── 4. recipes ────────────────────────────────────────────────
-- id is text so the client's short generateId() values work as PKs
CREATE TABLE IF NOT EXISTS recipes (
  id          text PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  link        text,
  ingredients text[]  NOT NULL DEFAULT '{}',
  category    text,
  tags        text[]  NOT NULL DEFAULT '{}',
  note        text,
  image       text,
  meal_type   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_recipes_all" ON recipes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 5. shared_recipes ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shared_recipes (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id      uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  shared_by_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by     text,
  name          text NOT NULL,
  link          text,
  source_type   text,
  ingredients   text[]  NOT NULL DEFAULT '{}',
  tags          text[]  NOT NULL DEFAULT '{}',
  note          text,
  image         text,
  meal_type     text,
  cook_approved boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shared_recipes ENABLE ROW LEVEL SECURITY;
-- Group members can read shared recipes in their groups
CREATE POLICY "group_member_read_shared" ON shared_recipes FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
-- Group members can share recipes
CREATE POLICY "group_member_share" ON shared_recipes FOR INSERT
  WITH CHECK (auth.uid() = shared_by_id
           AND group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
-- Sharer can delete their own shared recipe
CREATE POLICY "sharer_delete_shared" ON shared_recipes FOR DELETE USING (auth.uid() = shared_by_id);
-- Allow cook_approved update by any group member
CREATE POLICY "group_member_approve" ON shared_recipes FOR UPDATE
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- ── 6. meal_plans ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meal_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        date NOT NULL,
  slot        text NOT NULL CHECK (slot IN ('breakfast','lunch','dinner')),
  meal_name   text NOT NULL,
  meal_data   jsonb NOT NULL DEFAULT '{}',
  is_done     boolean NOT NULL DEFAULT false,
  is_skipped  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date, slot)
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_meal_plans_all" ON meal_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 7. grocery_items ─────────────────────────────────────────
-- id is text to support auto:ingredient-name format from the client
CREATE TABLE IF NOT EXISTS grocery_items (
  id         text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  unit       text,
  checked    boolean NOT NULL DEFAULT false,
  for_dates  text[]  NOT NULL DEFAULT '{}',
  source     text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_grocery_all" ON grocery_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 8. friends ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friends (
  id         text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  phone      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_friends_all" ON friends FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 9. Storage buckets ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('recipe-images', 'recipe-images', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile-images', 'profile-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth_upload_recipe_images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');
CREATE POLICY "public_read_recipe_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');

CREATE POLICY "auth_upload_profile_images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
CREATE POLICY "public_read_profile_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');
CREATE POLICY "own_update_profile_images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

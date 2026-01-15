-- api/sql/001_init.sql
-- Initializes schema for RateMyDiningHall (users, dining_halls, reviews)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dining halls table
CREATE TABLE IF NOT EXISTS dining_halls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school      TEXT NOT NULL,
  name        TEXT NOT NULL,
  location    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Avoid duplicates for same school + name
  CONSTRAINT dining_halls_school_name_unique UNIQUE (school, name)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dining_hall_id UUID NOT NULL REFERENCES dining_halls(id) ON DELETE CASCADE,
  rating         INT  NOT NULL,
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 1 user can only leave 1 review per dining hall (optional but recommended)
  CONSTRAINT reviews_user_dininghall_unique UNIQUE (user_id, dining_hall_id),

  -- Enforce rating range
  CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5)
);

-- Keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reviews_updated ON reviews;

CREATE TRIGGER trg_reviews_updated
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Indexes to speed up common queries
CREATE INDEX IF NOT EXISTS idx_dining_halls_school_name ON dining_halls (school, name);
CREATE INDEX IF NOT EXISTS idx_reviews_dining_hall_created ON reviews (dining_hall_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_created ON reviews (user_id, created_at DESC);

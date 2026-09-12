CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  phone          VARCHAR(30),
  password_hash  TEXT NOT NULL,
  role           VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'customer';

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS cakes (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(120) NOT NULL UNIQUE,
  short_desc     VARCHAR(240) NOT NULL,
  full_desc      TEXT NOT NULL,
  price          INTEGER NOT NULL CHECK (price >= 0),
  tag            VARCHAR(40) NOT NULL,
  badge          VARCHAR(20),
  image_url      TEXT NOT NULL,
  gallery_urls   TEXT[] NOT NULL DEFAULT '{}',
  is_available   BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cakes_tag ON cakes (tag);
CREATE INDEX IF NOT EXISTS idx_cakes_available ON cakes (is_available);

DROP TRIGGER IF EXISTS trg_cakes_updated_at ON cakes;
CREATE TRIGGER trg_cakes_updated_at
  BEFORE UPDATE ON cakes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER REFERENCES users(id) ON DELETE SET NULL,
  cake_id           INTEGER REFERENCES cakes(id) ON DELETE SET NULL,
  cake_name         VARCHAR(120) NOT NULL,
  size              VARCHAR(20) NOT NULL,
  frosting          VARCHAR(40) NOT NULL,
  price             INTEGER NOT NULL CHECK (price >= 0),
  customer_name     VARCHAR(120) NOT NULL,
  customer_phone    VARCHAR(30) NOT NULL,
  delivery_address  TEXT NOT NULL,
  delivery_date     DATE NOT NULL,
  notes             TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                      CHECK (status IN ('confirmed', 'baking', 'delivery', 'delivered', 'cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS contact_messages (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages (is_read);
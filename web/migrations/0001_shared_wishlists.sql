-- A wishlist shared from the app. The id is the code in the public link;
-- only a SHA-256 hash of the owner key is stored.
CREATE TABLE lists (
  id TEXT PRIMARY KEY,
  owner_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  -- Last time the app synced or checked the list; drives the 12-month clean-up.
  updated_at INTEGER NOT NULL
);

CREATE INDEX lists_updated_at ON lists (updated_at);

CREATE TABLE wishes (
  list_id TEXT NOT NULL REFERENCES lists (id) ON DELETE CASCADE,
  -- The wish's id in the app, so reservations survive edits.
  id TEXT NOT NULL,
  position INTEGER NOT NULL,
  name TEXT NOT NULL,
  size TEXT,
  note TEXT,
  link TEXT,
  priority TEXT NOT NULL,
  used_ok INTEGER NOT NULL,
  -- Guests are anonymous: a reservation stores only when, and a hash of a random
  -- browser cookie so the same browser can undo it.
  reserved_at INTEGER,
  reserver_hash TEXT,
  PRIMARY KEY (list_id, id)
);

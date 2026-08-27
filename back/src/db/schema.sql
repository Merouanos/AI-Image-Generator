CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY,
    prompt TEXT NOT NULL,
    style TEXT ,
    status TEXT NOT NULL DEFAULT 'queued',
    image_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
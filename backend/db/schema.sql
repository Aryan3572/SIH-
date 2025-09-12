-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    trip_number TEXT NOT NULL,
    origin TEXT,
    destination TEXT,
    time TIMESTAMP,
    mode TEXT,
    consent BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create travellers table
CREATE TABLE IF NOT EXISTS travellers (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT,
    age INTEGER,
    relation TEXT
);

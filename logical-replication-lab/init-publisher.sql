-- Publisher Initialization

-- Base table used by publication demo.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed rows help verify initial sync quickly.
INSERT INTO users (username, email) VALUES 
('alice', 'alice@example.com'),
('bob', 'bob@example.com');

-- Publication is kept manual for learning flow.
-- Gotcha: publication must exist before subscription can stream changes.
CREATE PUBLICATION demo_pub FOR TABLE users; 

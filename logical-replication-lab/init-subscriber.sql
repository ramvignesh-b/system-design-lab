-- Subscriber Initialization

-- Gotcha: subscriber schema must already exist and be compatible.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Do not seed rows here; data should arrive from publisher stream.

-- Subscription is kept manual for learning flow.
CREATE SUBSCRIPTION demo_sub 
CONNECTION 'host=publisher port=5432 user=admin dbname=demo_db' 
PUBLICATION demo_pub;

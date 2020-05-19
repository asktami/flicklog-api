CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    movie_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
   poster_path VARCHAR(255) NOT NULL DEFAULT '',
    backdrop_path VARCHAR(255) NOT NULL DEFAULT '',
    title VARCHAR(255) NOT NULL DEFAULT '',
    original_title VARCHAR(255) NOT NULL DEFAULT '',
    release_date DATE NULL,
    overview VARCHAR NOT NULL DEFAULT '',
    vote_average DECIMAL(3,0) NOT NULL DEFAULT 0.0,
    vote_count INTEGER NOT NULL DEFAULT 0
);

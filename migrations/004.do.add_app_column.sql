ALTER TABLE users ADD COLUMN app TEXT DEFAULT 'flicklog';
ALTER TABLE reviews ADD COLUMN app TEXT DEFAULT 'flicklog';
ALTER TABLE watchlist ADD COLUMN app TEXT DEFAULT 'flicklog';


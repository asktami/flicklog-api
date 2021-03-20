// production = hosted on Heroku using PostgreSQL db
// development = hosted locally using PostgreSQL db

// Default  NODE.ENV to development if not set
// Default TEST_DATABASE_URL to development DB URL if not set
// Default DATABASE_URL to production DB URL if not set

module.exports = {
	PORT: process.env.PORT || 8000,
	NODE_ENV: process.env.NODE_ENV || 'development',
	AUTH_TOKEN: process.env.AUTH_TOKEN || 'my-dummy-auth-token',
	TEST_DATABASE_URL:
		process.env.TEST_DATABASE_URL ||
		'postgresql://flicklog@localhost/flicklog-test',
	DATABASE_URL:
		process.env.DATABASE_URL || 'postgresql://flicklog@localhost/flicklog',
	JWT_SECRET: process.env.JWT_SECRET || 'my-JWT_EXPIRY-secret',
	JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
	EXTERNAL_ENDPOINT: `https://api.themoviedb.org/3`,
	API_KEY: process.env.API_KEY,
};

const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');

const db = knex({
	client: 'pg',
	connection: DATABASE_URL,
	acquireConnectionTimeout: 1000000,
	pool: {
		min: 0,
		max: 4,
		acquireTimeoutMillis: 300000,
		createTimeoutMillis: 300000,
		destroyTimeoutMillis: 300000,
		idleTimeoutMillis: 30000,
		reapIntervalMillis: 1000,
		createRetryIntervalMillis: 2000,
	},
	debug: false,
});

app.set('db', db);

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});

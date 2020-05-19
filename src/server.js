const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');

const db = knex({
	client: 'pg',
	connection: DATABASE_URL,
});

app.set('db', db);

// to DEBUG database connection ----------------------
console.log('NODE_ENV = ', process.env.NODE_ENV);
console.log('DATABASE_URL = ', DATABASE_URL);

const conn = db.select('*').from('reviews');

console.log('----------------');
const qrX = db
	.select('*')
	.from('reviews')
	.where('user_id', 1)
	.then((result) => {
		console.log('__________________qryX = ', result);
	});

const rows = db
	.select('*')
	.from(process.env.TEST_TABLE)
	.then((result) => {
		console.log('rows = ', result);
	});

console.log(conn.client.connectionSettings);
console.log('----------------');
// to END DEBUG database connection ----------------------

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});

const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

// Happy Path testing
describe('Protected endpoints', function() {
	let db;

	const { testUsers, testReviews, testWatchlist } = helpers.makeFixtures();

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL,
		});
		app.set('db', db);
	});

	after('disconnect from db', () => db.destroy());
	before('cleanup', () => helpers.cleanTables(db));
	afterEach('cleanup', () => helpers.cleanTables(db));

	beforeEach('insert data into all tables', () =>
		helpers.seedTables(db, testUsers, testReviews, testWatchlist)
	);

	const protectedEndpoints = [
		{
			name: 'POST /api/auth/refresh',
			path: '/api/auth/refresh',
			method: supertest(app).post,
		},
		{
			name: 'GET /api/reviews/:reviewId',
			path: '/api/reviews/1',
			method: supertest(app).get,
		},
		{
			name: 'GET /api/watchlist',
			path: '/api/watchlist',
			method: supertest(app).get,
		},
		{
			name: 'POST /api/watchlist/:movieId',
			path: '/api/watchlist/BUS04',
			method: supertest(app).post,
		},
		{
			name: 'DELETE /api/watchlist/:watchlistId',
			path: '/api/watchlist/1',
			method: supertest(app).post,
		},
	];

	protectedEndpoints.forEach((endpoint) => {
		describe(endpoint.name, () => {
			it(`responds 401 'Missing bearer token' when no bearer token`, () => {
				return endpoint
					.method(endpoint.path)
					.expect(401, { message: `Missing bearer token` });
			});

			it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
				const validUser = testUsers[0];
				const invalidSecret = 'bad-secret';

				return endpoint
					.method(endpoint.path)
					.set(
						'Authorization',
						helpers.makeAuthHeader(validUser, invalidSecret)
					)
					.expect(401, {
						message: `JsonWebTokenError: invalid signature(Unauthorized request)`,
					});
			});

			it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
				const invalidUser = { username: 'user-not-existy', id: 1 };
				return endpoint
					.method(endpoint.path)
					.set('Authorization', helpers.makeAuthHeader(invalidUser))
					.expect(401, { message: `Unauthorized request` });
			});
		});
	});
});

const knex = require('knex');
const jwt = require('jsonwebtoken');
const config = require('../src/config');
const app = require('../src/app');
const helpers = require('./test-helpers');

// Happy Path testing
describe('Auth Endpoints', function() {
	let db;

	const { testUsers } = helpers.makeFixtures();
	const testUser = testUsers[0];

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

	describe(`POST /api/auth/login`, () => {
		beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

		const requiredFields = ['username', 'password'];

		requiredFields.forEach((field) => {
			const loginAttemptBody = {
				username: testUser.username,
				password: testUser.password,
			};

			it(`responds with 400 required error when '${field}' is missing`, () => {
				delete loginAttemptBody[field];

				return supertest(app)
					.post('/api/auth/login')
					.send(loginAttemptBody)
					.expect(400, {
						message: `Missing '${field}' in request body`,
					});
			});
		});

		it(`responds 400 'invalid username or password' when bad username`, () => {
			const userInvalidUser = { username: 'user-not', password: 'existy' };
			return supertest(app)
				.post('/api/auth/login')
				.send(userInvalidUser)
				.expect(400, { message: `Incorrect username or password` });
		});

		it(`responds 400 'invalid username or password' when bad password`, () => {
			const userInvalidPass = {
				username: testUser.username,
				password: 'incorrect',
			};
			return supertest(app)
				.post('/api/auth/login')
				.send(userInvalidPass)
				.expect(400, { message: `Incorrect username or password` });
		});

		it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
			const userValidCreds = {
				username: testUser.username,
				password: testUser.password,
			};

			const expectedToken = jwt.sign(
				{ user_id: testUser.id },
				config.JWT_SECRET,
				{
					subject: testUser.username,
					expiresIn: config.JWT_EXPIRY,
					algorithm: 'HS256',
				}
			);
			return supertest(app)
				.post('/api/auth/login')
				.send(userValidCreds)
				.expect(200, {
					user_id: testUser.id,
					authToken: expectedToken,
				});
		});
	});

	describe(`POST /api/auth/refresh`, () => {
		beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

		it(`responds 200 and JWT auth token using secret`, () => {
			const expectedToken = jwt.sign(
				{ user_id: testUser.id },
				config.JWT_SECRET,
				{
					subject: testUser.username,
					expiresIn: config.JWT_EXPIRY,
					algorithm: 'HS256',
				}
			);
			return supertest(app)
				.post('/api/auth/refresh')
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.expect(200, {
					authToken: expectedToken,
				});
		});
	});
});

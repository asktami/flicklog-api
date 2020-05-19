const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', function() {
	let db;

	const { testUsers } = helpers.makeFixtures();
	const testUser = testUsers[0];

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL
		});
		app.set('db', db);
	});

	after('disconnect from db', () => db.destroy());

	before('cleanup', () => helpers.cleanTables(db));

	afterEach('cleanup', () => helpers.cleanTables(db));

	describe(`POST /api/users`, () => {
		context(`User Validation`, () => {
			beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

			const requiredFields = ['username', 'password', 'fullname'];

			requiredFields.forEach(field => {
				const registerAttemptBody = {
					username: 'test username',
					password: 'test password',
					fullname: 'test fullname'
				};

				it(`responds with 400 required error when '${field}' is missing`, () => {
					delete registerAttemptBody[field];

					return supertest(app)
						.post('/api/users')
						.send(registerAttemptBody)
						.expect(400, {
							message: `Missing '${field}' in request body`
						});
				});
			});

			it(`responds 400 'Password be longer than 7 characters' when empty password`, () => {
				const userShortPassword = {
					username: 'test username',
					password: '1234567',
					fullname: 'test fullname'
				};
				return supertest(app)
					.post('/api/users')
					.send(userShortPassword)
					.expect(400, {
						message: `Password must be longer than 7 characters`
					});
			});

			it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
				const userLongPassword = {
					username: 'test username',
					password: '*'.repeat(73),
					fullname: 'test fullname'
				};
				return supertest(app)
					.post('/api/users')
					.send(userLongPassword)
					.expect(400, { message: `Password must be less than 72 characters` });
			});

			it(`responds 400 error when password starts with spaces`, () => {
				const userPasswordStartsSpaces = {
					username: 'test username',
					password: ' 1Aa!2Bb@',
					fullname: 'test fullname'
				};
				return supertest(app)
					.post('/api/users')
					.send(userPasswordStartsSpaces)
					.expect(400, {
						message: `Password must not start or end with empty spaces`
					});
			});

			it(`responds 400 error when password ends with spaces`, () => {
				const userPasswordEndsSpaces = {
					username: 'test username',
					password: '1Aa!2Bb@ ',
					fullname: 'test fullname'
				};
				return supertest(app)
					.post('/api/users')
					.send(userPasswordEndsSpaces)
					.expect(400, {
						message: `Password must not start or end with empty spaces`
					});
			});

			it(`responds 400 error when password isn't complex enough`, () => {
				const userPasswordNotComplex = {
					username: 'test username',
					password: '11AAaabb',
					fullname: 'test fullname'
				};
				return supertest(app)
					.post('/api/users')
					.send(userPasswordNotComplex)
					.expect(400, {
						message: `Password must contain one upper case, lower case, number and special character`
					});
			});

			it(`responds 400 'User name already taken' when username isn't unique`, () => {
				const duplicateUser = {
					username: testUser.username,
					password: '11AAaa!!',
					fullname: 'test fullname'
				};
				return supertest(app)
					.post('/api/users')
					.send(duplicateUser)
					.expect(400, { message: `Username already taken` });
			});
		});

		context(`Happy path`, () => {
			it(`responds 201, serialized user, storing bcryped password`, () => {
				const newUser = {
					username: 'test username',
					password: '11AAaa!!',
					fullname: 'test fullname'
				};
				return supertest(app)
					.post('/api/users')
					.send(newUser)
					.expect(201)
					.expect(res => {
						expect(res.body).to.have.property('id');
						expect(res.body.username).to.eql(newUser.username);
						expect(res.body.fullname).to.eql(newUser.fullname);
						expect(res.body).to.not.have.property('password');
						expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
						const expectedDate = new Date().toLocaleString('en', {
							timeZone: 'UTC'
						});
						const actualDate = new Date(res.body.date_created).toLocaleString();
						expect(actualDate).to.eql(expectedDate);
					})
					.expect(res =>
						db
							.from('users')
							.select('*')
							.where({ id: res.body.id })
							.first()
							.then(row => {
								expect(row.username).to.eql(newUser.username);
								expect(row.fullname).to.eql(newUser.fullname);

								const expectedDate = new Date().toLocaleString('en', {
									timeZone: 'UTC'
								});
								const actualDate = new Date(row.date_created).toLocaleString();
								expect(actualDate).to.eql(expectedDate);

								return bcrypt.compare(newUser.password, row.password);
							})
							.then(compareMatch => {
								expect(compareMatch).to.be.true;
							})
					);
			});
		});
	});
});

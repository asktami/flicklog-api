const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

// Happy Path testing
describe('Movies Endpoints', function() {
	let db;

	const { testUsers, testMovies, testReviews } = helpers.makeFixtures();

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

	describe(`GET /api/movies/:movie_id/reviews`, () => {
		context('Given there are reviews for a movie in the database', () => {
			beforeEach('insert movies', () =>
				helpers.seedTables(db, testUsers, testReviews)
			);

			it("responds with 200 and the specified movie's reviews", () => {
				let movieId = testMovies[0].id;

				const filteredReviews = testReviews.filter(
					(review) => review.movie_id === movieId
				);

				const expectedReviews = filteredReviews.map((review) =>
					helpers.makeExpectedMovieReviews(review, testUsers)
				);

				return supertest(app)
					.get(`/api/movies/${movieId}/reviews`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedReviews);
			});
		});
	});
});

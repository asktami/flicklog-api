const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

// Happy Path testing
describe('Watchlist Endpoints', function() {
	let db;
	const {
		testUsers,
		testMovies,
		testReviews,
		testWatchlist,
	} = helpers.makeFixtures();

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

	// AUTHORIZED REQUESTS ***************************
	describe(`GET /api/watchlist`, () => {
		context('Given there are watchlists in the database', () => {
			beforeEach('insert watchlists', () =>
				helpers.seedTables(db, testUsers, testReviews, testWatchlist)
			);

			it('responds with 200 and all the watchlist records for the logged in user', () => {
				let userId = testUsers[0].id;

				const filteredWatchlist = testWatchlist.filter(
					(watchlist) => watchlist.user_id === userId
				);

				const expectedWatchlist = filteredWatchlist.map((watchlist) =>
					helpers.makeExpectedWatchlist(watchlist)
				);

				return supertest(app)
					.get(`/api/watchlist`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedWatchlist);
			});
		});
	});

	// POST WATCHLIST ITEM ************************************
	describe(`POST /api/watchlist/:movieId/`, () => {
		context('Given there are no watchlists in the database', () => {
			beforeEach('insert watchlists', () => helpers.seedTables(db, testUsers));

			it(`creates a watchlist record, responding with 201 and the new watchlist record`, () => {
				let movie_id = testMovies[0].id;

				const newWatchListItem = {
					movie_id,
					poster_path: 'poster_path',
					backdrop_path: 'backdrop_path',
					title: 'title',
					original_title: 'original_title',
					release_date: '1979-12-20',
					overview: 'overview',
					vote_average: 3,
					vote_count: 100,
				};

				return supertest(app)
					.post(`/api/watchlist/${movie_id}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.send(newWatchListItem)
					.expect(201)
					.expect((res) => {
						expect(res.body).to.have.property('movie_id');
						expect(res.body.movie_id).to.eql(newWatchListItem.movie_id);
						expect(res.headers.location).to.eql(`/api/watchlist/${movie_id}`);
					});
			});
		});
	});

	// DELETE WATCHLIST ITEM
	describe(`DELETE /api/watchlist/:watchlistId`, () => {
		context('Given there are watchlists in the database', () => {
			beforeEach('insert watchlists', () =>
				helpers.seedTables(db, testUsers, testReviews, testWatchlist)
			);

			it('responds with 204 and removes the watchlist item', () => {
				const idToRemove = 2;

				const expectedWatchlistItem = testWatchlist.filter(
					(watchlist) => watchlist.id !== idToRemove
				);

				return supertest(app)
					.delete(`/api/watchlist/${idToRemove}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204);
			});
		});
	});
});

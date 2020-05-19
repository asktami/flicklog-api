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
			beforeEach('insert watchlists', () =>
				helpers.seedTables(db, testUsers, testReviews)
			);

			it(`creates a watchlist record, responding with 201 and the new watchlist record`, () => {
				let movie_id = testMovies[0].id;

				const newWatchlistItem = {
					movie_id: movie_id,
					poster_path: '/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
					backdrop_path: '/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg',
					title: 'Alien',
					original_title: 'Alien',
					release_date: '1979-05-25',
					overview:
						'During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.',
					vote_average: 8.1,
					vote_count: 5694,
				};

				return supertest(app)
					.post(`/api/watchlist/${movie_id}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.send(newWatchlistItem)
					.expect(201)
					.expect((res) => {
						expect(res.body).to.have.property('id');
						expect(res.body.movie_id).to.eql(newWatchlistItem.movie_id);
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

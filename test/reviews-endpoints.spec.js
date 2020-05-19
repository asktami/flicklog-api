const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

// Happy Path testing
describe('Reviews Endpoints', function() {
	let db;
	const { testReviews, testUsers } = helpers.makeFixtures();

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
	describe(`GET /api/reviews/:reviewId`, () => {
		context(`Given no reviews`, () => {
			beforeEach(() => helpers.seedTables(db, testUsers));

			it(`responds with 404`, () => {
				const reviewId = 123456;
				return supertest(app)
					.get(`/api/reviews/${reviewId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { message: `Review Not Found` });
			});
		});

		context('Given there are reviews in the database', () => {
			beforeEach('insert reviews', () =>
				helpers.seedTables(db, testUsers, testReviews)
			);

			it('responds with 200 and the specified review', () => {
				const reviewId = 1;
				const expectedReview = helpers.makeExpectedReview(testReviews[0]);

				return supertest(app)
					.get(`/api/reviews/${reviewId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect((res) => {
						expect(res.body.review).to.eql(expectedReview.review);
						expect(res.body).to.have.property('id');
					});
			});
		});
	});

	// POST movie Reviews ************************************
	describe(`POST /api/reviews/`, () => {
		context('Given there are no reviews in the database', () => {
			beforeEach('insert reviews', () => helpers.seedTables(db, testUsers));

			it(`creates a review, responding with 201 and the new review`, () => {
				let testReview = testReviews[0];
				const newReview = {
					review: testReview.review,
					rating: testReview.rating,
					movie_id: testReview.movie_id,
					user_id: testReview.user_id,
					poster_path: testReview.poster_path,
					backdrop_path: testReview.backdrop_path,
					title: testReview.title,
					original_title: testReview.original_title,
					release_date: testReview.release_date,
					overview: testReview.overview,
					vote_average: testReview.vote_average,
					vote_count: testReview.vote_count,
				};
				return supertest(app)
					.post(`/api/reviews/`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.send(newReview)
					.expect(201)
					.expect((res) => {
						expect(res.body).to.have.property('id');
						expect(res.body.review).to.eql(newReview.review);
						expect(Number(res.body.rating)).to.eql(Number(newReview.rating));
						expect(res.body.movie_id).to.eql(newReview.movie_id);
						expect(res.body.user_id).to.eql(newReview.user_id);
						expect(res.headers.location).to.eql(`/api/reviews/${res.body.id}`);
					});
			});

			// loop thru required fields and test what happens when each is missing
			const requiredFields = ['review', 'rating'];

			requiredFields.forEach((field) => {
				let testReview = testReviews[0];
				let movieId = testReview.movie_id;

				const newReview = {
					review: testReview.review,
					rating: testReview.rating,
					movie_id: testReview.movie_id,
					user_id: testReview.user_id,
					poster_path: testReview.poster_path,
					backdrop_path: testReview.backdrop_path,
					title: testReview.title,
					original_title: testReview.original_title,
					release_date: testReview.release_date,
					overview: testReview.overview,
					vote_average: testReview.vote_average,
					vote_count: testReview.vote_count,
				};

				it(`responds with 400 and an error message when the '${field}' is missing`, () => {
					delete newReview[field];

					return supertest(app)
						.post(`/api/reviews/`)
						.send(newReview)
						.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
						.expect(400, {
							message: `Missing '${field}' in request body`,
						});
				});
			});
		});
	});

	// DELETE Review
	describe(`DELETE /api/reviews/:reviewId`, () => {
		context('Given there are reviews in the database', () => {
			beforeEach('insert reviews', () =>
				helpers.seedTables(db, testUsers, testReviews)
			);

			it('responds with 204 and removes the review', () => {
				const idToRemove = 2;

				const expectedReview = testReviews.filter(
					(review) => review.id !== idToRemove
				);

				return supertest(app)
					.delete(`/api/reviews/${idToRemove}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204);
			});
		});
	});

	// PATCH Reviews
	describe(`PATCH /api/reviews/:reviewId`, () => {
		context('Given there are reviews in the database', () => {
			beforeEach('insert reviews', () =>
				helpers.seedTables(db, testUsers, testReviews)
			);

			it('responds with 204 and updates the review', () => {
				const idToUpdate = 2;

				const reviewToUpdate = {
					review: 'updated review',
					rating: 2,
					movie_id: 348,
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

				const expectedReview = {
					...testReviews[idToUpdate - 1],
					...reviewToUpdate,
				};

				return supertest(app)
					.patch(`/api/reviews/${idToUpdate}`)
					.send(reviewToUpdate)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204)
					.then((res) =>
						supertest(app)
							.get(`/api/reviews/${idToUpdate}`)
							.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
							.expect((res) => {
								expect(res.body).to.have.property('id');
								expect(res.body.review).to.eql(expectedReview.review);
							})
					);
			});

			it(`responds with 400 when no required fields supplied`, () => {
				const idToUpdate = 2;
				return supertest(app)
					.patch(`/api/reviews/${idToUpdate}`)
					.send({ irrelevantField: 'foo' })
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(400, {
						message: `Update must contain review and rating`,
					});
			});

			it(`responds with 204 when updating only a subset of fields`, () => {
				const idToUpdate = 2;

				const reviewToUpdate = {
					review: 'updated review',
				};

				const expectedReview = {
					...testReviews[idToUpdate - 1],
					...reviewToUpdate,
				};

				return supertest(app)
					.patch(`/api/reviews/${idToUpdate}`)
					.send({
						...reviewToUpdate,
						fieldToIgnore: 'should not be in GET response',
					})
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204)
					.then((res) =>
						supertest(app)
							.get(`/api/reviews/${idToUpdate}`)
							.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
							.expect((res) => {
								expect(res.body).to.have.property('id');
								expect(res.body.review).to.eql(expectedReview.review);
							})
					);
			});
		});
	});
});

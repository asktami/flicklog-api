const xss = require('xss');
let table = 'reviews';

const reviewService = {
	// get reviewList records for logInUserId, join to user table
	getAllReviews(db, loginUserId) {
		return db
			.select(
				'reviews.id as review_id',
				'movie_id as id',
				'movie_id',
				'user_id',
				'review',
				'rating',
				'user_id',
				'poster_path',
				'backdrop_path',
				'title',
				'original_title',
				'release_date',
				'overview',
				'vote_average',
				'vote_count'
			)
			.from(table)
			.join('users', 'users.id', 'reviews.user_id')
			.where('reviews.user_id', loginUserId);
	},
	// whenever get single review by id,
	// join review record with (created by) user record
	getById(knex, id) {
		return knex
			.from(`reviews as rev`)
			.select(
				'rev.id',
				'rev.review',
				'rev.rating',
				'rev.date_created',
				'rev.date_modified',
				'rev.movie_id',
				'rev.user_id',
				knex.raw(
					`row_to_json(
				  (SELECT tmp FROM (
					SELECT
					  usr.id,
					  usr.username,
					  usr.fullname,
					  usr.date_created,
					  usr.date_modified
				  ) tmp)
				) AS "user"`
				)
			)
			.leftJoin('users AS usr', 'rev.user_id', 'usr.id')
			.where('rev.id', id)
			.first();
	},

	// after insert, return reviews record joined to users record
	// with all fields from reviews and users tables
	insertReview(knex, newReview) {
		return knex
			.insert(newReview)
			.into(table)
			.returning('*')
			.then(([review]) => review)
			.then((review) => reviewService.getById(knex, review.id));
	},

	deleteReview(knex, id) {
		return knex(table)
			.where({ id })
			.delete();
	},
	updateReview(knex, id, newReviewData) {
		return knex(table)
			.where({ id })
			.update(newReviewData);
	},

	serializeReview(review) {
		return review;
	},
};

module.exports = reviewService;

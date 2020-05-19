const xss = require('xss');

const movieService = {
	getReviewsForMovie(db, id) {
		return db
			.from('reviews AS rev')
			.select(
				'rev.id',
				'rev.review',
				'rev.rating',
				'rev.date_created',
				'rev.date_modified',
				'rev.movie_id',
				'rev.user_id',
				db.raw(
					`json_strip_nulls(
				row_to_json(
				  (SELECT tmp FROM (
					SELECT
					  usr.id,
					  usr.username,
					  usr.fullname,
					  usr.date_created,
					  usr.date_modified
				  ) tmp)
				)
			  ) AS "user"`
				)
			)
			.where('rev.movie_id', id)
			.leftJoin('users AS usr', 'rev.user_id', 'usr.id')
			.groupBy('rev.id', 'usr.id');
	},

	serializeMovieReview(review) {
		const { user } = review;
		return {
			id: review.id,
			user_id: user.id,
			review: xss(review.review),
			rating: xss(review.rating),
			movie_id: review.movie_id,
			fullname: user.fullname,
		};
	},
};

module.exports = movieService;

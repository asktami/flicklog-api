const express = require('express');
const movieService = require('./movies-service');

const movieRouter = express.Router();

//  NOT protected endpoint
//  Get ReviewsForMovies works both as unprotected and protected
// INTERNAL ************************
movieRouter.route('/:id/reviews').get((req, res, next) => {
	const { id } = req.params;
	const knexInstance = req.app.get('db');

	movieService
		.getReviewsForMovie(knexInstance, id)
		.then((reviews) => {
			res.json(reviews.map(movieService.serializeMovieReview));
		})
		.catch(next);
});

module.exports = movieRouter;

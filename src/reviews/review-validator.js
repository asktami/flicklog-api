const logger = require('../logger');

const NO_ERRORS = null;

// review = review, rating, movieId, userId

function getReviewValidationError({ review, rating }) {
	if (review && review.length < 5) {
		logger.error(`Invalid review '${review}' supplied`);
		return {
			message: `The review must be at least 5 characters`
		};
	}

	if (rating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
		logger.error(`Invalid rating '${rating}' supplied`);
		return {
			message: `The rating must be a number between 1 and 5`
		};
	}

	return NO_ERRORS;
}

module.exports = {
	getReviewValidationError
};

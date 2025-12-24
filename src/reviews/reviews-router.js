const express = require('express');
const path = require('path');
const logger = require('../logger');
const reviewService = require('./reviews-service');
const { getReviewValidationError } = require('./review-validator');

// for protected endpoints
const { requireAuth } = require('../middleware/jwt-auth');

const reviewRouter = express.Router();
const jsonBodyParser = express.json();

// all endpoints are protected
// requireAuth is how we capture loggedId userId = req.user.id

// get the user_id from the authorization header

// get all user reviews & post/save review - PROTECTED
reviewRouter
	.route('/')
	.all(requireAuth)
	.get((req, res, next) => {
		const knexInstance = req.app.get('db');

		// loginUserId will only exist after login
		const loginUserId = req.user.id; // from jwt-auth

		reviewService
			.getAllReviews(knexInstance, loginUserId)
			.then((reviews) => {
				res.json(reviews.map(reviewService.serializeReview));
			})
			.catch(next);
	})
	.post(requireAuth, jsonBodyParser, (req, res, next) => {
		const {
			movie_id,
			review,
			rating,
			poster_path,
			backdrop_path,
			title,
			original_title,
			release_date,
			overview,
			vote_average,
			vote_count,
		} = req.body;

		const newReview = {
			movie_id,
			review,
			rating,
			poster_path,
			backdrop_path,
			title,
			original_title,
			release_date,
			overview,
			vote_average,
			vote_count,
			app: 'flicklog',
		};

		const knexInstance = req.app.get('db');

		for (const [key, value] of Object.entries(newReview))
			if (value == null) {
				logger.error({
					message: `${key} is required`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`,
				});

				return res.status(400).json({
					message: `Missing '${key}' in request body`,
				});
			}

		const error = getReviewValidationError(newReview);
		if (error) {
			logger.error({
				message: `POST Validation Error`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`,
			});
			return res.status(400).send(error);
		}

		// req.user is set in middleware/basic-auth
		// this is the login user_id used to post reviews
		newReview.user_id = req.user.id; // from jwt-auth

		reviewService
			.insertReview(knexInstance, newReview)
			.then((review) => {
				logger.info({
					message: `Review with id ${review.id} created.`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`,
				});

				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${review.id}`))
					.json(reviewService.serializeReview(review));
			})
			.catch(next);
	});

// get review to be updated/deleted
reviewRouter
	.route('/:id/')
	.all(requireAuth)
	.all(checkReviewExists)
	.get((req, res) => {
		res.json(reviewService.serializeReview(res.review));
	})
	.delete((req, res, next) => {
		const { id } = req.params;

		const knexInstance = req.app.get('db');
		reviewService
			.deleteReview(knexInstance, id)
			.then((numRowsAffected) => {
				logger.info({
					message: `Review with id ${id} deleted.`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`,
				});

				// need to send back message instead of .end()
				res.status(204).json({
					message: true,
				});
			})
			.catch(next);
	})
	.patch(jsonBodyParser, (req, res, next) => {
		const knexInstance = req.app.get('db');
		const { id } = req.params;
		const { review, rating } = req.body;
		const reviewToUpdate = { review, rating };

		const numberOfValues = Object.values(reviewToUpdate).filter(Boolean).length;
		if (numberOfValues === 0) {
			logger.error({
				message: `Invalid update without required fields: review and rating`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`,
			});
			return res.status(400).json({
				message: `Update must contain review and rating`,
			});
		}

		const error = getReviewValidationError(reviewToUpdate);
		if (error) {
			logger.error({
				message: `PATCH Validation Error`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`,
			});
			return res.status(400).send(error);
		}

		reviewService
			.updateReview(knexInstance, id, reviewToUpdate)
			.then((numRowsAffected) => {
				res.status(204).end();
			})
			.catch(next);
	});

/* async/await syntax for promises */
async function checkReviewExists(req, res, next) {
	const { id } = req.params;

	try {
		const review = await reviewService.getById(
			req.app.get('db'),
			req.params.id
		);

		if (!review) {
			logger.error({
				message: `Review with id ${id} not found.`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`,
			});

			return res.status(404).json({
				message: `Review Not Found`,
			});
		}

		res.review = review;
		next();
	} catch (error) {
		next(error);
	}
}
module.exports = reviewRouter;

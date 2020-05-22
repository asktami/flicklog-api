const express = require('express');
const path = require('path');
const logger = require('../logger');

const watchlistService = require('./watchlist-service');

// for protected endpoints
const { requireAuth } = require('../middleware/jwt-auth');

const watchlistRouter = express.Router();
const jsonBodyParser = express.json();

// all endpoints are protected

watchlistRouter
	.route('/')
	.all(requireAuth)
	.get((req, res, next) => {
		// get all watchlist records for loginUserId

		// here we will ALWAYS have the loginUserId because the client makes this request with the Auhorization Header containing the AuthToken used by jwt-auth to find the logged in user's user record

		const loginUserId = req.user.id; // from jwt-auth
		const knexInstance = req.app.get('db');

		watchlistService
			.getWatchlist(knexInstance, loginUserId)
			.then((watchlist) => {
				if (!watchlist) {
					logger.error({
						message: `Watchlist with for loginUserId ${loginUserId} not found.`,
						request: `${req.originalUrl}`,
						method: `${req.method}`,
						ip: `${req.ip}`,
					});
					return res.status(404).json({
						message: `Watchlist with for loginUserId ${loginUserId} not found.`,
					});
				}
				res.json(watchlist.map(watchlistService.serializeWatchlist));
			})
			.catch(next);
	});

watchlistRouter
	.route('/:id') // always movie_id
	.all(requireAuth)
	.delete((req, res, next) => {
		// const { id } = req.params;

		const id = parseInt(req.params.id);
		const knexInstance = req.app.get('db');

		// delete watchlist record for loginUserId + movie_id
		const loginUserId = req.user.id; // from jwt-auth

		watchlistService
			.deleteWatchlistItem(knexInstance, id, loginUserId)
			.then((numRowsAffected) => {
				logger.info({
					message: `Watchlist with movie_id ${id} deleted.`,
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
	.post(requireAuth, jsonBodyParser, (req, res, next) => {
		const knexInstance = req.app.get('db');

		for (const field of ['id']) {
			if (!req.params[field]) {
				logger.error({
					message: `${field} is required`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`,
				});
				return res.status(400).send({
					message: `'${field}' is required`,
				});
			}
		}

		const {
			movie_id,
			poster_path,
			backdrop_path,
			title,
			original_title,
			release_date,
			overview,
			vote_average,
			vote_count,
		} = req.body;

		const newWatchListItem = {
			movie_id,
			poster_path,
			backdrop_path,
			title,
			original_title,
			release_date,
			overview,
			vote_average: parseFloat(vote_average),
			vote_count,
		};

		// from jwt-auth
		// req.user is set in middleware/basic-auth
		// this is the login user id
		newWatchListItem.user_id = req.user.id;

		let loginUserId = req.user.id;

		watchlistService
			.insertWatchlistIfNotExists(
				knexInstance,
				newWatchListItem,
				loginUserId,
				movie_id
			)
			.then((watchlist) => {
				logger.info({
					message: `movie_id ${watchlist.movie_id} added to watchlist.`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`,
				});
				res
					.status(201)
					.location(path.posix.join(req.originalUrl))
					.json(watchlistService.serializeWatchlist(watchlist));
			})
			.catch(next);
	});

module.exports = watchlistRouter;

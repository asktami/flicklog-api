const { AUTH_TOKEN } = require('./config');
const logger = require('./logger');

function validateBearerToken(req, res, next) {
	const authToken = req.get('Authorization');

	if (!authToken || authToken.split(' ')[1] !== AUTH_TOKEN) {
		logger.error(`Unauthorized request to path: ${req.path}`);
		return res
			.status(401)
			.json({ message: 'Unauthorized request INSIDE VALIDATE BEARER TOKEN' });
	}

	next();
}

module.exports = validateBearerToken;

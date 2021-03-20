require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const moviesRouter = require('./movies/movies-router');
const reviewsRouter = require('./reviews/reviews-router');
const watchlistRouter = require('./watchlist/watchlist-router');
const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');

// const validateBearerToken = require('./validate-bearer-token');
const errorHandler = require('./error-handler');

const app = express();

app.use(
	morgan(NODE_ENV === 'production' ? 'tiny' : 'common', {
		skip: () => NODE_ENV === 'test',
	})
);

//app.use(cors());

// from CodeMentor
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	// res.header('Access-Control-Allow-Credentials: true');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	// res.header("Access-Control-Max-Age", "1000")
	if (req.method == 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}
	next();
});

app.use(helmet());
app.use(helmet.hidePoweredBy());

// DO NOT USE validate bearer token b/c do in protected routes with jwt!!!
// app.use(validateBearerToken);

app.use('/api/movies', moviesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
	res.send('Hello, world!');
});

app.use(errorHandler);
module.exports = app;

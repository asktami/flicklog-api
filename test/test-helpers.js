const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

function makeUsersArray() {
	return [
		{
			id: 1,
			username: 'test-user-1',
			password: 'password',
			fullname: 'Test user 1',
			date_created: new Date('2029-01-22T16:28:32.615Z'),
		},
		{
			id: 2,
			username: 'test-user-2',
			password: 'password',
			fullname: 'Test user 2',
			date_created: new Date('2029-01-22T16:28:32.615Z'),
		},
		{
			id: 911,
			username: 'test-user-3',
			password: 'has-no-watchlist',
			fullname: 'Test user 3',
			date_created: new Date('2029-01-22T16:28:32.615Z'),
		},
	];
}

function makeReviewsArray(users, movies) {
	return [
		{
			id: 1,
			rating: 2,
			review: 'First test review of the movie Alien!',
			movie_id: movies[0].id,
			user_id: 1,
			poster_path: '/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
			backdrop_path: '/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg',
			title: 'Alien',
			original_title: 'Alien',
			release_date: '1979-05-25',
			overview:
				'During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.',
			vote_average: 8.1,
			vote_count: 5694,
		},
		{
			id: 2,
			rating: 3,
			review: 'Second test review!',
			movie_id: movies[1].id,
			user_id: 1,
			poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
			backdrop_path: '/pPj1yM2PXiC56GkUYmoT3qR9zka.jpg',
			title: '',
			original_title: 'Star Wars',
			release_date: '1977-05-25',
			overview:
				'Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.',
			vote_average: 8.1,
			vote_count: 5694,
		},
		{
			id: 3,
			rating: 1,
			review: 'Third test review!',
			movie_id: movies[0].id,
			user_id: 2,
			poster_path: '/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
			backdrop_path: '/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg',
			title: 'Alien',
			original_title: 'Alien',
			release_date: '1979-05-25',
			overview:
				'During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.',
			vote_average: 8.1,
			vote_count: 5694,
		},
		{
			id: 4,
			rating: 5,
			review: 'Fourth test review!',
			movie_id: movies[1].id,
			user_id: 2,
			poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
			backdrop_path: '/pPj1yM2PXiC56GkUYmoT3qR9zka.jpg',
			title: '',
			original_title: 'Star Wars',
			release_date: '1977-05-25',
			overview:
				'Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.',
			vote_average: 8.1,
			vote_count: 5694,
		},
	];
}

function makeWatchlistArray(users, movies) {
	return [
		{
			id: 1,
			movie_id: movies[0].id,
			user_id: users[0].id,
		},
		{
			id: 2,
			movie_id: movies[1].id,
			user_id: users[0].id,
		},
	];
}

function makeMoviesArray() {
	return [
		{
			id: 348,
		},
		{
			id: 11,
		},
	];
}

// watchlist
function makeExpectedWatchlist(watchlist) {
	return {
		id: watchlist.id,
		watchlist_id: watchlist.id,
		user_id: watchlist.user_id,
		movie_id: watchlist.movie_id,
	};
}

// reviews + users join table
function makeExpectedMovieReviews(review, testUsers) {
	const user = testUsers.find((user) => user.id === review.user_id);

	return {
		id: review.id,
		user_id: review.user_id,
		review: review.review,
		rating: String(review.rating),
		movie_id: review.movie_id,
		fullname: user.fullname,
	};
}

function makeExpectedReview(review) {
	return {
		id: review.id,
		review: review.review,
		rating: review.rating,
		movie_id: review.id,
		user_id: review.user_id,
	};
}

//  users can add/update/delete Reviews
// pass in testUsers[0], hardcoded test movie_id
function makeMaliciousReview() {
	const maliciousReview = {
		id: 911,
		user_id: 1,
		movie_id: '1',
		review: 'Naughty naughty very naughty <script>alert("xss");</script>',
		rating: 1,
	};

	const expectedReview = {
		...maliciousReview,
		review:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
	};
	return {
		maliciousReview,
		expectedReview,
	};
}

function makeFixtures() {
	const testUsers = makeUsersArray();
	const testMovies = makeMoviesArray();
	const testReviews = makeReviewsArray(testUsers, testMovies);
	const testWatchlist = makeWatchlistArray(testUsers, testMovies);
	return { testUsers, testMovies, testReviews, testWatchlist };
}

// for testing only, movies_id is a user generated text string, there is no movies table
function cleanTables(db) {
	return db.transaction((trx) =>
		trx.raw(`TRUNCATE reviews RESTART IDENTITY CASCADE;
	TRUNCATE watchlist  RESTART IDENTITY CASCADE;
	TRUNCATE users RESTART IDENTITY CASCADE;`)
	);
}

// to bcrypt passwords
function seedUsers(db, users) {
	const preppedUsers = users.map((user) => ({
		...user,
		password: bcrypt.hashSync(user.password, 1),
	}));
	return db
		.into('users')
		.insert(preppedUsers)
		.then(() => {
			// update the auto sequence to stay in sync
			db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id]);
		});
}

function seedTables(db, users, reviews = [], watchlist = []) {
	return seedUsers(db, users)
		.then(() => reviews.length && db.into('reviews').insert(reviews))
		.then(() => watchlist.length && db.into('watchlist').insert(watchlist));
}

function makeAuthHeader(user, secret = config.JWT_SECRET) {
	const token = jwt.sign({ user_id: user.id }, secret, {
		subject: user.username,
		expiresIn: config.JWT_EXPIRY,
		algorithm: 'HS256',
	});

	return `Bearer ${token}`;
}

module.exports = {
	makeUsersArray,
	makeMoviesArray,
	makeReviewsArray,
	makeWatchlistArray,

	makeExpectedReview,
	makeExpectedMovieReviews,
	makeExpectedWatchlist,

	makeMaliciousReview,

	makeFixtures,
	cleanTables,
	seedTables,
	makeAuthHeader,
	seedUsers,
};

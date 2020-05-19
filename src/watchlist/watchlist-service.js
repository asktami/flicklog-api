let table = 'watchlist';

const watchlistService = {
	// get watchlist records for logInUserId, join to user table
	getWatchlist(knex, loginUserId) {
		return knex
			.select(
				'watchlist.id as watchlist_id',
				'movie_id as id',
				'movie_id as movie_id',
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
			.join('users', 'users.id', 'watchlist.user_id')
			.where('watchlist.user_id', loginUserId);
	},
	insertWatchlistIfNotExists(knex, newWatchlistItem, loginUserId, movie_id) {
		return knex(table)
			.select('*')
			.where({ movie_id: movie_id, user_id: loginUserId })
			.then((rows) => {
				if (rows.length === 0) {
					// no matching records found
					// so ok to add new watchlist record
					// this prevents a duplicate watchlist record being created because of a page render timing issue
					//return knex(table).insert(newWatchlistItem);
					return watchlistService.insertWatchlist(knex, newWatchlistItem);
				} else {
					// return or throw - existing record found
					return rows[0];
				}
			});
	},
	insertWatchlist(knex, newWatchlistItem) {
		return knex
			.insert(newWatchlistItem)
			.into(table)
			.returning('*')
			.then((rows) => {
				return rows[0];
			});
	},
	getById(knex, id) {
		return knex
			.from(table)
			.select('*')
			.where('id', id)
			.first();
	},
	// get watchlist record for logInUserId + id (movie_id)
	deleteWatchlistItem(knex, id, loginUserId) {
		return knex(table)
			.where({ movie_id: id, user_id: loginUserId })
			.delete();
	},

	// record returned after successful Read/Create/Update
	serializeWatchlist(watchlist) {
		return watchlist;
	},
};

module.exports = watchlistService;

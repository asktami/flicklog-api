# flicklog-api

An Express server app with CRUD endpoints that get data from a PostgreSQL datasource.

Works with [https://github.com/asktami/flicklog-app](https://github.com/asktami/flicklog-app).

- a watchlist record is linked to both a _user_ record and a _movie_ record

- a review record is linked to both a _user_ record and a _movie_ record

- movies come from [https://www.themoviedb.org/](https://www.themoviedb.org/)

- SQL migration scripts to create the flicklog database with tables for watchlist, reviews, and users including relationships and CASCADES

- service objects for all tables

- routers to perform CRUD operations

- an Express server for the API with various endpoints

## Hosted on

- Heroku

## Setup

1. Clone this repo
2. In Terminal, change to the directory on your computer that contains this repo
3. Install dependencies: `npm install`

4. Create the database user (as a superuser): `createuser -s flicklog`

5. Create the `flicklog` PostgreSQL databases:

   - `createdb -U flicklog flicklog`
   - `createdb -U flicklog flicklog-test`

6. Environment:

   - Prepare the environment file: `cp example.env .env`
   - Replace values in `.env` with your custom values
   - The `AUTH_TOKEN` is used for the App endpoint authorized requests
   - Get your `AUTH_TOKEN` from (https://www.uuidgenerator.net/)[https://www.uuidgenerator.net/]
   - The `API_TOKEN` is your (TheMovieDb.org)[TheMovieDb.org] API Key

7. Create development and test database tables:

   - `npm run migrate`
   - `npm run migrate:test`

8. To delete the tables in the databases:
   - `npm run migrate -- 0`
   - `npm run migrate:test -- 0`

### Configure Postgres

For tests involving time to run properly, your Postgres database must be configured to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   - OS X, Homebrew: `/usr/local/var/postgres/postgresql.conf`
2. Uncomment the `timezone` line and set it to `UTC` as follows:

```
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Sample Data

- To seed the development database:

```
psql -U flicklog -d flicklog -f ./seeds/seed.flicklog_tables.sql
```

- To seed the test database:

```
psql -U flicklog -d flicklog-test -f ./seeds/seed.flicklog_tables.sql
```

- To clear seed data:

```
psql -U flicklog -d flicklog -a -f seeds/trunc.flicklog_tables.sql
psql -U flicklog -d flicklog-test -a -f seeds/trunc.flicklog_tables.sql
```

## Endpoints

| Endpoint                    | HTTP Method | CRUD Method | Result                                                    |
| --------------------------- | ----------- | ----------- | --------------------------------------------------------- |
| movies                      | GET         | READ        | get all movies                                            |
| movies/search               | GET         | READ        | get all movies matching query                             |
| movies/:id                  | GET         | READ        | get single movie                                          |
| movies/:id/reviews          | GET         | READ        | get all reviews for a movie                               |
| movies/:id/add-review       | -link-      | -           | must login before adding a review                         |
| movies/:id/add-to-watchlist | -link-      | -           | must login before adding movie to watchlist               |
| movies/:id/reviews          | POST        | CREATE      | PRIVATE: add new review for a movie                       |
| reviews                     | GET         | READ        | PRIVATE: get all movie reviews for the logged in user     |
| reviews/:id                 | GET         | READ        | PRIVATE: get single movie review                          |
| reviews/:id                 | PATCH       | UPDATE      | PRIVATE: update single movie review                       |
| reviews/:id                 | DELETE      | DELETE      | PRIVATE: delete single movie review                       |
| watchlist                   | GET         | READ        | PRIVATE: get all watchlist records for the logged in user |
| watchlist/:movie_id         | POST        | CREATE      | PRIVATE: add new movie to user's watchlist                |
| watchlist/:movie_id         | DELETE      | DELETE      | PRIVATE: delete movie from a user's watchlist             |
| users                       | GET         | READ        | get logged in user                                        |
| users                       | POST        | CREATE      | register new user                                         |

## Scripts

- Start application for development: `npm run dev`
- Run tests: `npm test`

---

## Boilerplate Info

This project was bootstrapped with [Express Boilerplate with Routes, Winston and UUID](https://github.com/asktami/express-boilerplate-routes).

See [https://github.com/asktami/bookmarks-server](https://github.com/asktami/bookmarks-server) for info on how I create my Express APIs.

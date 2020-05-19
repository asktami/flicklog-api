# flicklog-api

An Express server app with CRUD endpoints that gets data from a PostgreSQL datasource.

Works with [https://github.com/asktami/flicklog-app](https://github.com/asktami/flicklog-app).

- a watchlist is linked to both a _user_ record and a _movie_ record

- a review is linked to both a _user_ record and a _movie_ record

- SQL migration scripts to create the flicklog database with tables for movies, watchlist, reviews, and users including relationships and CASCADES

- service objects for all tables

- routers to perform CRUD operations

- an Express server for the API with various endpoints

## Hosted on

- Heroku

## Setup

1. Clone this repo
2. In Terminal, change to the directory on your computer that contains this repo
3. Install dependencies: `npm install`
   `(to use node-fetch: npm i node-fetch --save)`

4. Create the database user (as a superuser): `createuser -s flicklog`

5. Create the `flicklog` PostgreSQL databases:

   - `createdb -U flicklog flicklog`
   - `createdb -U flicklog flicklog-test`

6. Environment:

   - Prepare environment file: `cp example.env .env`
   - Replace values in `.env` with your custom values.

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
2. Unreview the `timezone` line and set it to `UTC` as follows:

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

| Endpoint               | HTTP Method | CRUD Method | Result                                          |
| ---------------------- | ----------- | ----------- | ----------------------------------------------- |
| movies                 | GET         | READ        | get all movies                                  |
| movies/:id             | GET         | READ        | get single movie                                |
| movies/:id/reviews     | GET         | READ        | get all reviews for a movie                     |
| movies/:id/reviews     | POST        | CREATE      | add new review for a movie                      |
| reviews/:id            | GET         | READ        | get single review                               |
| reviews/:id            | PATCH       | UPDATE      | update single review                            |
| reviews/:id            | DELETE      | DELETE      | delete single review                            |
| watchlist              | GET         | READ        | get all scehdule records for the logged in user |
| watchlist/:movieId     | POST        | CREATE      | add new movie to user's watchlist               |
| watchlist/:watchlistId | DELETE      | DELETE      | delete watchlist record                         |
| users                  | POST        | CREATE      | add new user                                    |

## Scripts

- Start application for development: `npm run dev`
- Run tests: `npm test`

---

## Boilerplate Info

This project was bootstrapped with [Express Boilerplate with Routes, Winston and UUID](https://github.com/asktami/express-boilerplate-routes).

See [https://github.com/asktami/bookmarks-server](https://github.com/asktami/bookmarks-server) for info on how I created my Express APIs.

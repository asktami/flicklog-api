process.env.TZ = 'UTC';

require('dotenv').config();

// Set timezone to UTC for test database connections
// This will be applied when knex connections are created
if (process.env.NODE_ENV === 'test' || !process.env.NODE_ENV) {
	// Set a global hook that test files can use to configure their knex instances
	global.configureTestKnex = (knexInstance) => {
		return knexInstance.raw("SET timezone = 'UTC'");
	};
}

const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;

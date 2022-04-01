
const server = require('../routes/index.js')
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

describe('Testing On Index.js', () => {
    test('responds to /', async () => {
        const res = await requestWithSupertest.get('/users');



    });
})
const axios = require('axios');
const request = require('supertest')('https://airportgap.dev-tester.com/api');
const expect = require('chai').expect;

describe('Getting answers from question', () => {
  it("returns all answers for question, limit 5 per page", async function () {
    const response = await request.get('localhost:3000/qa/questions');

    expect(response.status).to.eql(200);
    expect(response.body.data.length).to.eql(5);
  });
})
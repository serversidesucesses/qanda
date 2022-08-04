const axios = require('axios');
const request = require('supertest')('https://airportgap.dev-tester.com/api');
const expect = require('chai').expect;

describe('Getting questions from product', () => {
  it('returns all questions for product, limit 5 per page', async function () {
    const response = await request.get('localhost:3000/qa/questions');

    expect(response.status).to.eql(200);
    expect(response.body.data.length).to.eql(5);
  });
})

describe('Posting a question for product', () => {
  it('posts a question for a product', async function () {
    const body =             {
      "question_body": "What fabric is the top made of?",
      "asker_name": "izzi",
      "question_helpfulness": 0,
      "date_written": 0,
      "reported": 0,
      "answers": {}
  }
    const response = await request.get('localhost:3000/qa/questions');

    expect(response.status).to.eql(201);
  });
})

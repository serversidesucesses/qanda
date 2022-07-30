require('dotenv').config({path: '../.env'});

const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOSTNAME,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3000
})

//GET /qa/questions Retrieves a list of questions for a particular product. This list does not include any reported questions.

const getQuestionsForProduct = (req, res) => {
  console.log(req.query.product_id);
  const productId = parseInt(req.query.product_id) || 1;
  const page = parseInt(req.query.page) || 1;
  const count = parseInt(req.query.count) || 5;

  pool.query(`SELECT * FROM questions WHERE product_id = $1 LIMIT $2 OFFSET $3`, [productId, count, (count * (page - 1))])
  .then(({ rows }) => res.status(200).json(rows))
  .catch(err => res.status(500).json(err))
}

//LIMIT $2 OFFSET $3`, [productId, count, (count * (page - 1))])

//Returns answers for a given question. This list does not include any reported answers. GET /qa/questions/:question_id/answers

const getAnswersForQuestion = (req, res) => {
  const questionId = parseInt(req.params.question_id);
  const page = parseInt(req.query.page) || 1;
  const count = parseInt(req.query.count) || 5;

  pool.query(`SELECT * FROM answers WHERE question_id = $1 LIMIT $2 OFFSET $3`, [productId, count, (count * (page - 1))])
  .catch(err => res.status(500).json(err))
}

//Adds a question for the given product. POST /qa/questions

const postQuestion = (req, res) => {
  console.log(req);
  const body = req.body;
  const name = req.body.name;
  const email = req.body.email;
  const productId = req.query.product_id;

  // pool.query(`INSERT INTO questions `)
}

//Add an Answer. Adds an answer for the given question

const postAnswerToQuestion = (req, res) => {

}

//Updates a question to show it was found helpful. PUT /qa/questions/:question_id/helpful

const markQuestionAsHelpful = (req, res) => {

}

//Updates a question to show it was reported. Note, this action does not delete the question, but the question will not be returned in the above GET request. PUT /qa/questions/:question_id/report

const reportQuestion = (req, res) => {

}

//Updates an answer to show it was found helpful. PUT /qa/answers/:answer_id/helpful

const markAnswerAsHelpful = (req, res) => {

}

//Updates an answer to show it has been reported. Note, this action does not delete the answer, but the answer will not be returned in the above GET request. PUT /qa/answers/:answer_id/report

const reportAnswer = (req, res) => {

}

module.exports = {
  getQuestionsForProduct,
  getAnswersForQuestion,
  postQuestion,
  postAnswerToQuestion,
  markQuestionAsHelpful,
  reportQuestion,
  markAnswerAsHelpful,
  reportAnswer
}

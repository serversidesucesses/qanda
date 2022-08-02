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

  pool.query(`WITH QUESTIONANSWER AS
  (SELECT QUESTIONS.ID AS question_id,
    QUESTIONS.BODY,
    QUESTIONS.ASKER_NAME,
    QUESTIONS.DATE_WRITTEN,
    (SELECT (JSON_OBJECT_AGG
        (ANSWERS.ID,JSON_BUILD_OBJECT(
            'id',ANSWERS.ID,
            'body',ANSWERS.BODY,
            'answerer_name', answers.answerer_name,
            'date_written', answers.date_written,
            'helpfulness', 0,
            'photos', (SElECT coalesce(json_agg(photos.url), '[]') FROM photos WHERE photos.answer_id = answers.id)
            )
        )
        )
         FROM ANSWERS
        WHERE ANSWERS.QUESTION_ID = QUESTIONS.ID
    ) AS ANSWER,
    (SElECT coalesce(json_agg(photos.url), '[]') FROM photos WHERE photos.answer_id = answers.id) AS photo
  FROM QUESTIONS left join answers on questions.id = answers.question_id
  WHERE QUESTIONS.PRODUCT_ID = $1)
  SELECT question_id, JSON_AGG(JSON_BUILD_OBJECT(
                'question_id', question_id,
                'question_body', BODY,
                'asker_name', asker_name,
                'question_helpfulness', 0,
                'date_written', date_written,
                'reported', 0,
                'answers', ANSWER
                )) AS RESULTS
  FROM QUESTIONANSWER
  GROUP BY 1 OFFSET ($2 - 1) * $3
  LIMIT $3`, [productId, page, count])
  .then(({ rows }) => res.status(200).json(rows))
  .catch(err => res.status(500).json(err))
}
// add 'date', date ^
// WITH QUESTIONANSWER AS
// (SELECT QUESTIONS.ID AS question_id,
//   QUESTIONS.BODY,
//   QUESTIONS.ASKER_NAME,
//   (SELECT (JSON_OBJECT_AGG
//       (ANSWERS.ID,JSON_BUILD_OBJECT(
//           'id',ANSWERS.ID,
//           'body',ANSWERS.BODY
//           )
//       )
//       )
//        FROM ANSWERS
//       WHERE ANSWERS.QUESTION_ID = QUESTIONS.ID
//   ) AS ANSWER,
//   (SElECT coalesce(json_agg(json_build_object('id', photos.id, 'url', photos.url)), '[]') FROM photos WHERE photos.answer_id = answers.id) AS photo
// FROM QUESTIONS left join answers on questions.id = answers.question_id
// WHERE QUESTIONS.PRODUCT_ID = $1)
// SELECT question_id, JSON_AGG(JSON_BUILD_OBJECT(
//               'question_id',question_id,
//               'question_body', BODY,
//               'answers', ANSWER,
//               'photos', photo
//               )) AS RESULTS
// FROM QUESTIONANSWER
// GROUP BY 1

//Returns answers for a given question. This list does not include any reported answers. GET /qa/questions/:question_id/answers

const getAnswersForQuestion = (req, res) => {
  const questionId = parseInt(req.params.question_id);
  const page = parseInt(req.query.page) || 1;
  const count = parseInt(req.query.count) || 5;
  console.log(req.params);

  pool.query(`SELECT ${questionId} AS question,
      ${page} AS page,
      ${count} AS count,
      coalesce(json_agg(
        json_build_object(
          'id', answers.id,
          'body', answers.body,
          'answerer_name', answers.answerer_name,
          'date_written', answers.date_written,
          'helpfulness', answers.helpful,
          'photos', (SELECT coalesce(json_agg(
            json_build_object(
              'id', photos.id,
              'url', photos.url
            )), '[]')
            FROM photos WHERE photos.answer_id = answers.id
          )
        )
      ), '[]') AS results
    FROM answers
    WHERE answers.question_id = ${questionId}
    OFFSET ${count * (page - 1)}
    LIMIT ${count}
    ;
  `)
  .then(({ rows }) => res.status(200).json(rows))
  .catch(err => res.status(500).json(err))
}
//[questionId, count, page, (count * (page - 1))]

//Adds a question for the given product. POST /qa/questions

const postQuestion = (req, res) => {
  console.log(req);
  const body = req.body.body;
  const name = req.body.asker_name;
  const email = req.body.asker_email;
  const productId = req.query.product_id;
  const date = date.now();
  const reported = 0;
  const helpful = 0;

  pool.query(`INSERT INTO questions (product_id, body, asker_name, asker_email, reported, helpful, date_written) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [productId, body, name, email, reported, helpful, date])
  .catch(err => res.status(500).json(err));
}

//Add an Answer. Adds an answer for the given question

const postAnswerToQuestion = (req, res) => {
  const questionId = parseInt(req.params.question_id);
  const body = req.body.body;
  const name = req.body.answerer_name;
  const email = req.body.answerer_email;
  // const photos =
  // const date = // ??
  const reported = 0;
  const helpful = 0;

  pool.query(`INSERT INTO answers (question_id, photo_id, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)` [questionId, photos, body, date, name, email, reported, helpful]);

}

//Updates a question to show it was found helpful. PUT /qa/questions/:question_id/helpful

const markQuestionAsHelpful = (req, res) => {
  const questionId = parseInt(req.params.question_id);

  pool.query(`UPDATE answers SET helpful = helpful + 1 WHERE question_id = $1`, [questionId]);
}

//Updates a question to show it was reported. Note, this action does not delete the question, but the question will not be returned in the above GET request. PUT /qa/questions/:question_id/report

const reportQuestion = (req, res) => {
  const questionId = parseInt(req.params.question_id);

  pool.query(`UPDATE answers SET reported = 1 WHERE question_id = $1`, [questionId]);
}

//Updates an answer to show it was found helpful. PUT /qa/answers/:answer_id/helpful

const markAnswerAsHelpful = (req, res) => {
  const answerId = parseInt(req.params.answer_id);

  pool.query(`UPDATE answers SET helpful = helpful + 1 WHERE answer_id = $1`, [answerId]);
}

//Updates an answer to show it has been reported. Note, this action does not delete the answer, but the answer will not be returned in the above GET request. PUT /qa/answers/:answer_id/report

const reportAnswer = (req, res) => {
  const answerId = parseInt(req.params.answer_id);

  pool.query(`UPDATE answers SET reported = 1 WHERE answer_id = $1`, [answerId]);
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

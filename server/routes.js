// import postgresql from 'pg';
require('dotenv').config({path: '../.env'});
const express = require('express');
const cors = require('cors');
const db = require('./index.js');
const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.get('/loaderio-1cf71f8f894a2258324cbf5016a0c217', (req, res) => {
  res.status(200).send('loaderio-1cf71f8f894a2258324cbf5016a0c217')
});
app.get('/qa/questions', db.getQuestionsForProduct);
app.get('/qa/questions/:question_id/answers', db.getAnswersForQuestion);
app.post('/qa/questions', db.postQuestion);
app.post('/qa/questions/:question_id/answers', db.postAnswerToQuestion);
app.put('/qa/questions/:question_id/helpful', db.markQuestionAsHelpful);
app.put('/qa/questions/:question_id/report', db.reportQuestion);
app.put('/qa/answers/:answer_id/helpful', db.markAnswerAsHelpful);
app.put('/qa/answers/:answer_id/report', db.reportAnswer)

app.listen(port);
console.log(`Server listening at http://localhost:${port}`);

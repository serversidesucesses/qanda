DROP TABLE IF EXISTS questions, answers, photos CASCADE;

CREATE TABLE questions (
  "id" SERIAL PRIMARY KEY,
  "product_id" INT NOT NULL,
  "body" VARCHAR(1000) NOT NULL,
  "asker_email" VARCHAR(60) NOT NULL,
  "date_written" BIGINT NOT NULL,
  "asker_name" VARCHAR(60),
  "reported" BIT NOT NULL,
  "helpful" INT NOT NULL
);

--

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  "question_id" INT NOT NULL REFERENCES questions(id),
  "photo_id" INT,
  "body" VARCHAR(1000) NOT NULL,
  "date_written" BIGINT NOT NULL,
  "answerer_name" VARCHAR(60) NOT NULL,
  "answerer_email" VARCHAR(60) NOT NULL,
  "reported" BIT NOT NULL,
  "helpful" INT NOT NULL
);

CREATE TABLE photos (
  "id" SERIAL PRIMARY KEY,
  answer_id INT NOT NULL REFERENCES answers(id),
  "url" TEXT NOT NULL
);

ALTER TABLE answers
  ADD CONSTRAINT answers_photo_id_fkey FOREIGN KEY (photo_id)
  REFERENCES photos (id) ON DELETE SET NULL ON UPDATE CASCADE;


CREATE INDEX questionidindex ON answers(question_id);
CREATE INDEX answeridindex ON photos(answer_id);

\copy questions(id,product_id,body,date_written,asker_name,asker_email,reported,helpful) FROM '/home/ubuntu/questions.csv' csv header;

\copy answers(id,question_id,body,date_written,answerer_name,answerer_email,reported,helpful) FROM '/home/ubuntu/answers.csv' csv header;

\copy photos(id,answer_id,url) FROM '/home/ubuntu/answers_photos.csv' csv header;

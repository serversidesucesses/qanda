import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// A simple counter for http requests

export const requests = new Counter('http_reqs');

// you can specify stages of your test (ramp up/down patterns) through the options object
// target is the number of VUs you are aiming for

export const scenarios = {
  questions: {
    executor: 'constant-arrival-rate',
    rate: 1000,
    timeUnit: '1s',
    duration: '30s',
    preAllocatedVUs: 100,
    maxVUs: 20000,
    exec: 'questions'
  },
  answers: {
    executor: 'constant-arrival-rate',
    rate: 1000,
    timeUnit: '1s',
    duration: '30s',
    preAllocatedVUs: 100,
    maxVUs: 20000,
    exec: 'answers'
  }
};

export const options = {
  thresholds: {
    http_req_duration: ['p(99)<=2000', 'p(95)<=1500', 'p(90)<=1000'],
    http_req_failed: ['rate<=0.01']
  },
  scenarios: {}
};

if (__ENV.scenario) {
  options.scenarios[__ENV.scenario] = scenarios[__ENV.scenario];
} else {
  options.scenarios = scenarios;
};

export function questions() {
  const res = http.get('http://localhost:3000/qa/questions');
  sleep(1);
}
export function answers() {
  const res = http.get('http://localhost:3000/qa/questions/9999999/answers');
  sleep(1);
}

export default function () {
  // our HTTP request, note that we are saving the response to res, which can be accessed later

  const res = http.get('http://test.k6.io');

  sleep(1);

  const checkRes = check(res, {
    'status is 200': (r) => r.status === 200,

    'response body': (r) => r.body.indexOf('Feel free to browse') !== -1,
  });
}
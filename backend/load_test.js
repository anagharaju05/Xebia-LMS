const fs = require('fs');
const http = require('http');
const path = require('path');

const payloadPath = path.join(__dirname, '../Documentation/datasets/api_payloads.json');
const PAYLOADS = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

const BASE_URL = process.env.API_URL || 'http://localhost:8080';
const CONCURRENT_REQUESTS = 200;

const ENDPOINTS = [
  { path: '/api/courses', method: 'GET' },
  { path: '/api/management/students', method: 'GET' },
  { path: '/api/assessments', method: 'GET' },
  { path: '/api/courses', method: 'POST', getPayload: (i) => PAYLOADS.courses[i % 20] },
  { path: '/api/management/students', method: 'POST', getPayload: (i) => PAYLOADS.students[i % 20] },
  { path: '/api/assessments', method: 'POST', getPayload: (i) => PAYLOADS.assessments[i % 20] }
];

console.log(`Starting load test against ${BASE_URL} with ${CONCURRENT_REQUESTS} concurrent requests...`);

let completed = 0;
let successCount = 0;
let errorCount = 0;
let totalTime = 0;

let authToken = '';

function authenticate() {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + '/api/auth/login');
    const payload = JSON.stringify({ email: "admin@xebia.com", password: "admin" });
    
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const body = JSON.parse(data);
            authToken = body.token || '';
            resolve();
          } catch (e) { resolve(); }
        } else {
          resolve(); // Try without token if login fails
        }
      });
    });
    
    req.on('error', () => resolve());
    req.write(payload);
    req.end();
  });
}

function makeRequest(index) {
  const endpoint = ENDPOINTS[index % ENDPOINTS.length];
  const payload = endpoint.method === 'POST' ? JSON.stringify(endpoint.getPayload(index)) : undefined;

  const url = new URL(BASE_URL + endpoint.path);
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: endpoint.method,
    headers: {}
  };

  options.headers['X-Organization-ID'] = '11111111-1111-1111-1111-111111111111';
  options.headers['X-User-Id'] = 'load-tester';
  options.headers['X-User-Role'] = 'ADMIN';

  if (payload) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(payload);
  }

  const startTime = Date.now();

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      res.on('data', () => {}); // Consume response
      res.on('end', () => {
        const timeTaken = Date.now() - startTime;
        totalTime += timeTaken;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          successCount++;
        } else {
          errorCount++;
        }
        completed++;
        resolve();
      });
    });

    req.on('error', (e) => {
      errorCount++;
      completed++;
      resolve();
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runLoadTest() {
  await authenticate();
  const promises = [];
  const testStartTime = Date.now();

  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(makeRequest(i));
  }

  await Promise.all(promises);

  const duration = (Date.now() - testStartTime) / 1000;
  
  console.log('\n--- LOAD TEST RESULTS ---');
  console.log(`Total Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Duration: ${duration.toFixed(2)} seconds`);
  console.log(`Requests/sec: ${(CONCURRENT_REQUESTS / duration).toFixed(2)}`);
  console.log(`Success: ${successCount} (${((successCount/CONCURRENT_REQUESTS)*100).toFixed(1)}%)`);
  console.log(`Errors: ${errorCount} (${((errorCount/CONCURRENT_REQUESTS)*100).toFixed(1)}%)`);
  console.log(`Average Latency: ${(totalTime / CONCURRENT_REQUESTS).toFixed(2)} ms`);
}

runLoadTest();

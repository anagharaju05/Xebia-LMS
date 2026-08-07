const fs = require('fs');
const http = require('http');

const data = JSON.parse(fs.readFileSync('./events_data.json', 'utf8'));
const BASE_URL = process.env.API_URL || 'http://localhost:8080';

let authToken = '';

function authenticate() {
  return new Promise((resolve) => {
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
          } catch (e) {}
        }
        resolve();
      });
    });
    
    req.on('error', () => resolve());
    req.write(payload);
    req.end();
  });
}

let successCount = 0;
let errorCount = 0;

function postEvent(event, index) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(event);
    const url = new URL(BASE_URL + '/api/events');
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-Organization-ID': '11111111-1111-1111-1111-111111111111',
        'X-User-Id': 'load-tester',
        'X-User-Role': 'ADMIN'
      }
    };
    
    if (authToken) {
      options.headers['Authorization'] = 'Bearer ' + authToken;
    }

    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[${index + 1}/${data.length}] Success: ${event.title}`);
          successCount++;
        } else {
          console.error(`[${index + 1}/${data.length}] Error ${res.statusCode}: ${resData}`);
          errorCount++;
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`[${index + 1}/${data.length}] Request failed: ${e.message}`);
      errorCount++;
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  await authenticate();
  console.log(`Starting bulk upload of ${data.length} events...`);
  // using batching to make it fast but not overwhelm
  for (let i = 0; i < data.length; i += 5) {
      const batch = data.slice(i, i + 5);
      await Promise.all(batch.map((ev, idx) => postEvent(ev, i + idx)));
  }
  console.log(`\nUpload complete. Success: ${successCount}, Errors: ${errorCount}`);
}

run();

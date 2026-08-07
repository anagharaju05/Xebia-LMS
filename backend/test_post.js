const http = require('http');

const event = {
    "title": "Load Test Event 1",
    "description": "Load Testing description for event 1",
    "startTime": "2026-07-15T09:00:00",
    "endTime": "2026-07-15T10:00:00",
    "eventType": "WEBINAR",
    "locationOrLink": "https://zoom.us/test1",
    "status": "PUBLISHED",
    "maxCapacity": 50
};

const payload = JSON.stringify(event);
const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/events',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-Organization-ID': '11111111-1111-1111-1111-111111111111',
        'X-User-Id': 'load-tester',
        'X-User-Role': 'ADMIN'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
req.write(payload);
req.end();

const http = require('http');

const headers = {
    'X-Organization-ID': '123e4567-e89b-12d3-a456-426614174000',
    'X-User-Id': 'load-tester',
    'X-User-Role': 'ADMIN'
};

http.get({
    hostname: 'localhost',
    port: 8080,
    path: '/api/courses',
    headers
}, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        const courses = JSON.parse(body);
        const toDelete = courses.filter(c => !c.id.startsWith('c0a80101'));
        
        console.log("Found " + toDelete.length + " courses to delete.");
        
        let count = 0;
        toDelete.forEach(c => {
            const req = http.request({
                hostname: 'localhost',
                port: 8080,
                path: '/api/courses/' + c.id,
                method: 'DELETE',
                headers
            });
            req.on('response', () => {
                count++;
                if(count === toDelete.length) console.log('Finished deleting all ' + count + ' courses!');
            });
            req.end();
        });
    });
});

const res = await fetch('https://xebia-lms-backend.onrender.com/api/management/students/assignments');
const text = await res.text();
try {
  const json = JSON.parse(text);
  console.log('Total:', json.length);
  const relevant = json.filter(a => a.title === 'random');
  console.log(JSON.stringify(relevant, null, 2));
} catch (e) {
  console.log('Response was not JSON:', text.substring(0, 100));
}

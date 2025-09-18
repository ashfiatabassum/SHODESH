const http = require('http');

function postJson(path, payload, timeout = 10000) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({ ok: true, statusCode: res.statusCode, headers: res.headers, body });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });

    req.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });

    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('Testing /api/individual/register');
  const individualPayload = {
    firstName: 'CLI',
    lastName: 'Test',
    username: 'cli_test_ind_9999',
    email: 'cli_test_ind_9999@example.com',
    mobile: '01722223333',
    dob: '1990-01-01',
    password: 'secret123',
    houseNo: '1',
    roadNo: '2',
    area: 'Area',
    district: 'Dhaka',
    division: 'Dhaka',
    zipCode: '1000',
    bkashNumber: '01722223333',
    bankAccount: '123456'
  };

  const indRes = await postJson('/api/individual/register', individualPayload, 10000);
  console.log('Individual result:', indRes);

  console.log('\nTesting /api/donor/register');
  const donorPayload = {
    firstName: 'CLI',
    lastName: 'Donor',
    username: 'cli_test_donor_9999',
    password: 'secret123',
    email: 'cli_test_donor_9999@example.com',
    country: 'Bangladesh',
    division: 'Dhaka',
    dateOfBirth: '1990-01-01'
  };

  const donorRes = await postJson('/api/donor/register', donorPayload, 10000);
  console.log('Donor result:', donorRes);

  process.exit(0);
})();

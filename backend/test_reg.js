const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: "Test User",
            email: "test_" + Date.now() + "@example.com",
            password: "password123"
        });
        console.log('SUCCESS:', res.status, res.data);
    } catch (err) {
        console.log('ERROR:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
    }
}

test();

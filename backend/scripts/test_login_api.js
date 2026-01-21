// testing login with fetch

async function testLogin() {
    try {
        const res = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('LOGIN SUCCESSFUL!');
            console.log('Token:', data.token);
        } else {
            console.log('LOGIN FAILED:', data);
        }
    } catch (e) {
        console.error('FETCH ERROR:', e.message);
    }
}

testLogin();

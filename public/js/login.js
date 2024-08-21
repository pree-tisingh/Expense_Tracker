document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
            window.location.href = `/dashboard.html?token=${data.token}`; // Redirect to dashboard.html with the token
        } else {
            alert('Login failed: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred during login.');
    }
});

document.getElementById('forgotPasswordBtn').addEventListener('click', function() {
    window.location.href = 'forget.html';
});
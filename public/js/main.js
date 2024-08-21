document.getElementById('signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const number = document.getElementById('number').value;
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, number }),
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Signup successful!');
            window.location.href = '/Login.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

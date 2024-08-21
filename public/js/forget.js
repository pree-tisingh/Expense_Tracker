document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    axios.post('/password/forgotpassword', { email })
        .then(response => {
            document.getElementById('message').innerText = 'Email sent successfully!';
        })
        .catch(error => {
            console.error('There was an error sending the email:', error);
            document.getElementById('message').innerText = 'Error sending email. Please try again.';
        });
});

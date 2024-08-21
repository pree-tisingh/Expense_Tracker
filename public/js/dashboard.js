document.addEventListener('DOMContentLoaded', async () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseTableBody = document.getElementById('expense-table').querySelector('tbody');
    const buyPremiumButton = document.getElementById('buy-premium');
    const premiumMessage = document.getElementById('premium-message');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const leaderboardList = document.getElementById('leaderboard-list');
    const closeLeaderboardButton = document.getElementById('close-leaderboard');
    const reportButton = document.getElementById('report-button');
    const reportModal = document.getElementById('report-modal');
    const closeReportButton = document.getElementById('close-report');
    const reportOptions = document.querySelectorAll('.report-option');


    leaderboardButton.style.display = 'none';
    reportButton.style.display = 'none';
    // Get the token from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        alert('Token is missing. Please log in again.');
        window.location.href = '/Login.html'; // Redirect to login page
        return;
    }

    // Function to check if the user is premium
    const checkPremiumStatus = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/check-premium-status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.isPremium; // Adjust according to your API response structure
            } else {
                console.error('Error fetching premium status');
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    };

    // Check premium status and update UI accordingly
    const isPremium = await checkPremiumStatus();

    if (isPremium) {
        reportButton.style.display = 'block';
        leaderboardButton.style.display = 'block'; // Show leaderboard button
        buyPremiumButton.style.display = 'none';
        premiumMessage.style.display = 'block'; // Show premium message
    } else {
        buyPremiumButton.style.display = 'block';
        premiumMessage.style.display = 'none'; // Hide premium message
        leaderboardButton.style.display = 'none'; // Ensure leaderboard button is hidden
        reportButton.style.display = 'none'; // Ensure report button is hidden
    }

    // Show report modal on report button click
    reportButton.addEventListener('click', () => {
        reportModal.style.display = 'block';
    });

    // Close report modal
    closeReportButton.addEventListener('click', () => {
        reportModal.style.display = 'none';
    });

    // Fetch user data
    const userResponse = await fetch('/api/me', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const userData = await userResponse.json();

    let userId = null; // Initialize userId

    if (userData.success) {
        userId = userData.user.id; // Assign userId from user data
        if (userData.user.isPremium) {
            buyPremiumButton.style.display = 'none';
            premiumMessage.style.display = 'block'; // Show premium message
        } else {
            buyPremiumButton.style.display = 'block';
            premiumMessage.style.display = 'none'; // Hide premium message
        }
    } else {
        alert('Failed to fetch user data. Please try again.');
        console.error('Error fetching user data:', userData.message);
    }

    // Navigate to the selected report section
    reportOptions.forEach(option => {
        option.addEventListener('click', () => {
            const reportType = option.getAttribute('data-report-type');
            console.log('Selected report type:', reportType); // Debugging line
    
            let reportFile;
    
            switch (reportType) {
                case 'daily':
                    reportFile = 'report-daily.html';
                    break;
                case 'weekly':
                    reportFile = 'report-weekly.html';
                    break;
                case 'monthly':
                    reportFile = 'report-monthly.html';
                    break;
                default:
                    console.error('Unknown report type:', reportType);
                    return;
            }
    
            console.log('Redirecting to:', `/${reportFile}?userId=${userId}&token=${token}`); // Debugging line
            window.location.href = `/${reportFile}?userId=${userId}&token=${token}`;
        });
    });
    

    // Add event listener for the leaderboard button
    leaderboardButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/leaderboard', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.users)) {
                leaderboardList.innerHTML = data.users.map(user => `
                    <li> User: ${user.name}, Total Expenses: ${user.totalExpenses}</li>
                `).join('');
                leaderboardModal.style.display = 'block'; // Show the leaderboard modal
            } else {
                console.error('Error fetching leaderboard:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    });

    closeLeaderboardButton.addEventListener('click', () => {
        leaderboardModal.style.display = 'none'; // Hide the leaderboard modal
    });

    // Fetch Razorpay key from the server
    const razorpayKeyResponse = await fetch('/api/razorpay-key');
    const razorpayKeyData = await razorpayKeyResponse.json();
    const razorpayKey = razorpayKeyData.key;

    // Fetch and display existing expenses on page load
    fetchExpenses(token);

    // Event listener for form submission
    expenseForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;

        const expense = { amount, description, category, userId }; // Include userId in expense object

        try {
            const response = await fetch('/api/expenses/addExpense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(expense)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (data.success && data.expense) {
                addExpenseToTable(data.expense);
                expenseForm.reset();
            } else {
                console.error('Error adding expense:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error adding expense:', error.message);
        }
    });

    // Event listener for Buy Premium button
    buyPremiumButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/orders/createOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (data.success) {
                const options = {
                    "key": razorpayKey, // Use fetched Razorpay key
                    "amount": data.order.amount, // Amount in paise
                    "currency": "INR",
                    "name": "Expense Tracker",
                    "description": "Premium Membership",
                    "order_id": data.order.id, // Order ID from backend
                    "handler": async (response) => {
                        try {
                            const res = await fetch('/api/orders/updateOrder', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + token
                                },
                                body: JSON.stringify({
                                    orderId: data.order.id,
                                    paymentId: response.razorpay_payment_id,
                                    signature: response.razorpay_signature
                                })
                            });

                            if (!res.ok) {
                                const errorText = await res.text();
                                throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
                            }

                            const result = await res.json();

                            if (result.success) {
                                buyPremiumButton.style.display = 'none';
                                premiumMessage.style.display = 'block'; // Show premium message
                                alert('Transaction successful!');
                            } else {
                                alert('Transaction failed!');
                            }
                        } catch (error) {
                            console.error('Error updating order:', error.message);
                        }
                    },
                    "prefill": {
                        "name": "",
                        "email": "",
                        "contact": ""
                    },
                    "notes": {
                        "address": "Expense Tracker Premium Membership"
                    },
                    "theme": {
                        "color": "#F37254"
                    }
                };

                const rzp = new Razorpay(options);
                rzp.open();
            } else {
                alert('Error creating order!');
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    });

    // Function to fetch expenses
    async function fetchExpenses(token) {
        try {
            const response = await fetch('/api/expenses/getExpenses', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.expenses)) {
                data.expenses.forEach(expense => addExpenseToTable(expense));
            } else {
                console.error('Error fetching expenses:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error fetching expenses:', error.message);
        }
    }

    // Function to add a new expense row to the table
    function addExpenseToTable(expense) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${expense.amount || 'N/A'}</td>
            <td>${expense.description || 'N/A'}</td>
            <td>${expense.category || 'N/A'}</td>
            <td>
                <button class="edit-btn" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;

        expenseTableBody.appendChild(row);

        // Add event listeners for edit and delete buttons
        row.querySelector('.edit-btn').addEventListener('click', () => editExpense(expense.id));
        row.querySelector('.delete-btn').addEventListener('click', () => deleteExpense(expense.id, token));
    }

    // Function to handle editing an expense
    function editExpense(expenseId) {
        // Implementation for editing an expense
        console.log('Edit expense:', expenseId);
    }

    // Function to handle deleting an expense
    async function deleteExpense(expenseId, token) {
        try {
            const response = await fetch(`/api/expenses/${expenseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (data.success) {
                // Remove the expense row from the table
                const expenseRow = document.querySelector(`button.delete-btn[data-id="${expenseId}"]`).closest('tr');
                if (expenseRow) {
                    expenseRow.remove();
                }
            } else {
                console.error('Error deleting expense:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error deleting expense:', error.message);
        }
    }
});

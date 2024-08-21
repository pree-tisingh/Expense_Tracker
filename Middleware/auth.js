const jwt = require('jsonwebtoken');

// Ensure you have the JWT_SECRET environment variable set
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
        }

        req.user = user; // Set the user object on req
        next();
    });
};

module.exports = authenticateToken;

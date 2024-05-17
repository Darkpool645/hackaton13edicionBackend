const jwt = require('jsonwebtoken');

const JWT_SECRET = '2c270115ae56d4cde440388050dab6030aed0e59851d71d16b266b07a57ee49d';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            message: 'Authentication token is missing'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid authentication token'
        });
    }
}

module.exports = authMiddleware;

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ msg: 'No token, access denied' });

    token = token.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};

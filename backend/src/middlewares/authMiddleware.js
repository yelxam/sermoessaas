const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        // Fetch full user to ensure we have email and latest role
        const User = require('../models/User');
        const userDB = await User.findByPk(req.user.id);

        if (!userDB) {
            return res.status(401).json({ msg: 'User not found' });
        }

        // Merge DB user data into req.user (keeping payload data but enhancing it)
        req.user = { ...req.user, email: userDB.email, name: userDB.name, role: userDB.role };

        // Verify if company is active
        const Company = require('../models/Company');
        const company = await Company.findByPk(req.user.company_id, {
            attributes: ['active']
        });

        if (!company || !company.active) {
            return res.status(403).json({
                msg: 'Sua conta está desativada. Por favor, entre em contato com o suporte ou verifique seu pagamento.',
                inactive: true
            });
        }

        next();
    } catch (err) {
        if (err.status === 403) return res.status(403).json(err.data);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

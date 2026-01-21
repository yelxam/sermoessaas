module.exports = function (req, res, next) {
    const superAdmins = [
        'admin@sermon.ai',
        'eliel@verbocast.com.br',
        'financeiro@verbocast.com.br'
    ];

    if (!req.user || !superAdmins.includes(req.user.email)) {
        return res.status(403).json({ msg: 'Acesso negado. Apenas superadmins podem realizar esta ação.' });
    }
    next();
};

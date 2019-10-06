module.exports = function (req, res, next) {
    if (!req.user.role === 'A') return res.status(403).send('Access Denied....');
    next();
}
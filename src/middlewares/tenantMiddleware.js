module.exports = (req, res, next) => {
if (!req.user?.tenant) {
return res.status(403).json({ message: 'Tenant not found' });
}
req.tenantId = req.user.tenant;
next();
};
// middleware/admin.js

module.exports = function (req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).send("Access denied. Admins only.");
  }
  next();
};

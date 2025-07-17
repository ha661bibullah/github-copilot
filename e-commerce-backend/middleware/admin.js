// middleware/admin.js
module.exports = (req, res, next) => {
    // আপনার অ্যাডমিন ভেরিফিকেশন লজিক এখানে যোগ করুন
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

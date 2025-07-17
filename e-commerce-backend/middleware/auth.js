const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")
    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" })
    }

    const token = authHeader.replace("Bearer ", "")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded.user.id })

    if (!user) {
      return res.status(401).json({ msg: "Token is not valid" })
    }

    req.user = user
    req.token = token
    next()
  } catch (err) {
    console.error("Auth middleware error:", err)
    res.status(401).json({ msg: "Token is not valid" })
  }
}

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(403).json({ msg: "Access denied. Admin privileges required." })
  }
}

module.exports = { auth, admin }

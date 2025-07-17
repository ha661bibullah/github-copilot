const express = require("express")
const router = express.Router()
const { auth, admin } = require("../middleware/auth")
const User = require("../models/User")
const Product = require("../models/Product")
const { check, validationResult } = require("express-validator")

// Get user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Update user profile
router.put(
  "/me",
  [auth, [check("name", "Name is required").not().isEmpty(), check("email", "Please include a valid email").isEmail()]],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email } = req.body

    try {
      const user = await User.findById(req.user.id)
      if (!user) {
        return res.status(404).json({ msg: "User not found" })
      }

      // Check if email is already taken
      if (email !== user.email) {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          return res.status(400).json({ msg: "Email already in use" })
        }
      }

      user.name = name
      user.email = email
      await user.save()

      res.json(user)
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server error")
    }
  },
)

// Update user password
router.put(
  "/me/password",
  [
    auth,
    [
      check("currentPassword", "Current password is required").not().isEmpty(),
      check("newPassword", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { currentPassword, newPassword } = req.body

    try {
      const user = await User.findById(req.user.id)
      if (!user) {
        return res.status(404).json({ msg: "User not found" })
      }

      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ msg: "Current password is incorrect" })
      }

      user.password = newPassword
      await user.save()

      res.json({ msg: "Password updated successfully" })
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server error")
    }
  },
)

// Add address
router.post("/me/addresses", auth, async (req, res) => {
  try {
    const { street, city, state, country, zipCode, isDefault } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // If setting as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false
      })
    }

    user.addresses.push({
      street,
      city,
      state,
      country,
      zipCode,
      isDefault,
    })

    await user.save()
    res.json(user.addresses)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Update address
router.put("/me/addresses/:id", auth, async (req, res) => {
  try {
    const { street, city, state, country, zipCode, isDefault } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === req.params.id)

    if (addressIndex === -1) {
      return res.status(404).json({ msg: "Address not found" })
    }

    // If setting as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false
      })
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      street,
      city,
      state,
      country,
      zipCode,
      isDefault,
    }

    await user.save()
    res.json(user.addresses)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Delete address
router.delete("/me/addresses/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.id)

    await user.save()
    res.json(user.addresses)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Add to wishlist
router.post("/me/wishlist/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // Check if product exists
    const product = await Product.findById(req.params.productId)
    if (!product) {
      return res.status(404).json({ msg: "Product not found" })
    }

    // Check if already in wishlist
    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ msg: "Product already in wishlist" })
    }

    user.wishlist.push(req.params.productId)
    await user.save()

    res.json(user.wishlist)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Remove from wishlist
router.delete("/me/wishlist/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    user.wishlist = user.wishlist.filter((productId) => productId.toString() !== req.params.productId)

    await user.save()
    res.json(user.wishlist)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Get all users (Admin)
router.get("/", [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Update user (Admin)
router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const { name, email, isAdmin } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // Check if email is already taken
    if (email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ msg: "Email already in use" })
      }
    }

    user.name = name
    user.email = email
    user.isAdmin = isAdmin
    await user.save()

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// Delete user (Admin)
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ msg: "User removed" })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router

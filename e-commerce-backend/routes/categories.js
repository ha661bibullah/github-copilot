const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get single category
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Category not found' });
        }
        res.status(500).send('Server error');
    }
});

// Create category (Admin only)
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file ? req.file.path : '';

        const category = new Category({
            name,
            description,
            image
        });

        await category.save();
        res.json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update category (Admin only)
router.put('/:id', [auth, admin, upload.single('image')], async (req, res) => {
    try {
        const { name, description } = req.body;
        let image;

        if (req.file) {
            image = req.file.path;
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                ...(image && { image })
            },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        res.json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete category (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        // Check if category has products
        const productsCount = await Product.countDocuments({ category: category._id });
        if (productsCount > 0) {
            return res.status(400).json({ msg: 'Cannot delete category with products' });
        }

        await category.remove();
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Category not found' });
        }
        res.status(500).send('Server error');
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, featured, new: isNew, onSale, search, sort } = req.query;
        const query = {};
        
        if (category) query.category = category;
        if (featured === 'true') query.isFeatured = true;
        if (isNew === 'true') query.isNew = true;
        if (onSale === 'true') query.onSale = true;
        if (search) query.name = { $regex: search, $options: 'i' };

        let sortOption = {};
        if (sort === 'price-low') sortOption = { price: 1 };
        if (sort === 'price-high') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortOption);
            
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server error');
    }
});

// Get related products
router.get('/:id/related', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        res.json(relatedProducts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create product (Admin only)
router.post('/', auth, admin, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, shortDescription, price, oldPrice, category, stock, attributes, isFeatured, isNew, onSale } = req.body;
        
        const images = req.files.map(file => file.path);

        const product = new Product({
            name,
            description,
            shortDescription,
            price,
            oldPrice,
            category,
            images,
            stock,
            attributes: JSON.parse(attributes),
            isFeatured,
            isNew,
            onSale
        });

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update product (Admin only)
router.put('/:id', auth, admin, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, shortDescription, price, oldPrice, category, stock, attributes, isFeatured, isNew, onSale } = req.body;
        
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        let images = product.images;
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path);
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                shortDescription,
                price,
                oldPrice,
                category,
                images,
                stock,
                attributes: JSON.parse(attributes),
                isFeatured,
                isNew,
                onSale
            },
            { new: true }
        );

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete product (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        await product.remove();
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server error');
    }
});

// Add review
router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.user.id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ msg: 'Product already reviewed' });
        }

        const review = {
            user: req.user.id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        product.reviews.push(review);
        product.reviewCount = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ msg: 'Review added' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

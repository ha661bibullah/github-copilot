const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create new order
router.post(
    '/',
    [
        auth,
        [
            check('orderItems', 'Order items are required').not().isEmpty(),
            check('shippingAddress', 'Shipping address is required').not().isEmpty(),
            check('paymentMethod', 'Payment method is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { orderItems, shippingAddress, paymentMethod } = req.body;

        try {
            // Calculate prices
            let itemsPrice = 0;
            const items = [];

            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                if (!product) {
                    return res.status(404).json({ msg: 'Product not found' });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({ msg: `Not enough stock for ${product.name}` });
                }

                itemsPrice += product.price * item.quantity;
                items.push({
                    product: item.product,
                    quantity: item.quantity,
                    price: product.price,
                    color: item.color,
                    size: item.size
                });

                // Reduce stock
                product.stock -= item.quantity;
                await product.save();
            }

            const taxPrice = itemsPrice * 0.1; // 10% tax
            const shippingPrice = itemsPrice > 50 ? 0 : 5; // Free shipping over $50
            const totalPrice = itemsPrice + taxPrice + shippingPrice;

            const order = new Order({
                user: req.user.id,
                items,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice
            });

            const createdOrder = await order.save();
            res.status(201).json(createdOrder);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// Get all orders (Admin)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email');
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user orders
router.get('/myorders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check if user owns order or is admin
        if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(order);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server error');
    }
});

// Update order to paid
router.put('/:id/pay', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check if user owns order or is admin
        if (order.user.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update order to delivered (Admin)
router.put('/:id/deliver', [auth, admin], async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';

        const updatedOrder = await order.save();
        res.json(updatedOrder);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
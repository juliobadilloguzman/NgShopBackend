const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {

    try {

        const orderList = await Order.find().populate(['user', 'orderItems']).sort({ 'dateOrdered': -1 });

        return res.status(200).send(orderList);

    } catch (error) {

        return res.status(500).json({
            error: `There was an error in retrieving the orders.`,
            success: false
        });

    }

});

router.get(`/:id`, async (req, res) => {

    try {

        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate({
                path: 'orderItems', populate: {
                    path: 'product', populate: 'category'
                }
            });

        return res.send(order);

    } catch (error) {

        return res.status(500).json({
            message: `There was an error in retrieving the order with id ${req.params.id}.`,
            success: false,
            error: error
        });

    }


});

router.get(`/get/count`, async (req, res) => {

    try {

        const orderCount = await Order.countDocuments();
        res.json({ count: orderCount });

    } catch (error) {

        return res.status(500).json({
            message: `There was an error in retrieving the order count.`,
            error: error,
            success: false
        });

    }

});

router.get('/get/totalSales', async (req, res) => {

    try {

        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
        ]);

        res.json({ totalSales: totalSales.pop().totalSales });

    } catch (error) {

        return res.status(500).json({
            error: error,
            status: 500,
            message: `Could not generate the total sales`
        });

    }

});

router.get('/get/userOrders/:userId', async (req, res) => {

    try {

        const orderList = await Order.find({ user: req.params.userId })
            .populate('user')
            .populate({
                path: 'orderItems', populate: {
                    path: 'product', populate: 'category'
                }
            }).sort({ 'dateOrdered': -1 });

        return res.status(200).send(orderList);

    } catch (error) {

        return res.status(500).json({
            error: `There was an error in retrieving the orders.`,
            success: false
        });

    }

});

router.post('/', async (req, res) => {

    //Create Order Items before the actual Order

    const orderItemsIds = await Promise.all(req.bordy.orderItems.map(async (orderItem) => {

        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;

    }));

    const orderTotalPrice = await Promise.all(orderItemsIds.map(async (orderItemId) => {

        const orderItemFound = await OrderItem.findById(orderItemId).populate('product', 'price');

        const totalPrice = orderItemFound.quantity * orderItemFound.product.pice;

        return totalPrice;

    }));

    const totalPrice = orderTotalPrice.reduce((prev, curr) => prev + curr, 0);

    let newOrder = new Order({
        orderItems: orderItemsIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
        dateOrdered: req.body.dateOrdered
    });

    try {

        const createdOrder = await newOrder.save();
        return res.status(201).send(createdOrder)

    } catch (error) {

        return res.status(400).json({
            error: error,
            message: `There was an error in creating the order`,
            success: false
        });

    }

});

router.put('/:id', async (req, res) => {

    try {

        let orderFound = await Order.findByIdAndUpdate(req.params.id, {
            status: req.body.status
        }, { new: true });

        res.send(orderFound);

    } catch (error) {

        return res.status(400).json({
            error: error,
            message: 'There was an error in retreiving the order',
            status: 400
        });

    }

});

router.delete('/:id', async (req, res) => {

    try {

        const orderDeleted = await Order.findById(req.params.id);

        //Delete the Order Items first
        try {

            await Promise.all(orderDeleted.orderItems.map(async (orderItem) => {

                await OrderItem.findOneAndRemove(orderItem._id);

                console.log(`Order ${orderItem._id} deleted successfully`);

            }));

        } catch (error) {

            return res.status(201).json({
                error: error,
                message: 'Order items cannot be deleted'
            });

        }

        await Order.findByIdAndRemove(req.params.id);

        return res.status(201).json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {

        return res.status(400).json({
            error: error,
            status: 400,
            message: `There was an error in deleting the order: ${req.params.id}`
        });

    }

});


module.exports = router;
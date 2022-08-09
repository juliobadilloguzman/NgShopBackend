const { Product } = require('../models/product');
const { Category } = require('../models/category');
const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, __dirname.replace('routes', '') + '/public/uploads');
    },

    filename: function (req, file, cb) {

        const fileName = file.originalname.replace(' ', '-');
        
        const extension = FILE_TYPE_MAP[file.mimetype];

        const error = (extension == null) ? new Error('Invalid extension') : null;

        cb(error, `${fileName.split('.')[0]}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {

    try {

        let filters = {};

        if (req.query.categories) {

            filters = { category: req.query.categories.split(',') };

        }

        const productList = await Product.find(filters).populate('category');
        return res.send(productList);

    } catch (error) {

        return res.status(500).json({
            message: `There was an error in retrieving the products.`,
            error: error,
            success: false
        });

    }

});

router.get(`/:id`, async (req, res) => {

    try {

        const product = await Product.findById(req.params.id).populate('category');

        if (!product) {

            return res.status(404).json({
                message: `The product with id ${req.params.id} could not be found.`,
                success: false
            });

        }

        res.send(product);

    } catch (error) {

        return res.status(500).json({
            message: `There was an error in retrieving the product with id ${req.params.id}:`,
            error: error,
            success: false
        });

    }

});

router.get(`/get/count`, async (req, res) => {

    try {

        const productCount = await Product.countDocuments();
        res.send({ count: productCount });

    } catch (error) {

        return res.status(500).json({
            message: `There was an error in retrieving the product count.`,
            error: error,
            success: false
        });

    }

});

router.get(`/featured/:count?`, async (req, res) => {

    try {

        const count = req.params.count ?? 0;

        const productFeaturedList = await Product.find({ isFeatured: true }).limit(+count);
        res.send(productFeaturedList);

    } catch (error) {

        return res.status(500).json({
            message: `There was an error in retrieving the product count.`,
            error: error,
            success: false
        });

    }

});


router.post('/', uploadOptions.single('image'), async (req, res) => {

    const category = await Category.findById(req.body.category);

    if (!category) {

        return res.status(404).json({
            error: `The category with id ${req.body.category} could not be found.`,
            success: false
        });

    }

    const file = req.file;

    if(!file){

        return res.status(400).json({
            message: 'There is no file'
        });

    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    try {

        const createdProduct = await newProduct.save();
        return res.status(201).send(createdProduct);

    } catch (error) {

        return res.status(500).json({
            error: error,
            message: 'The product could not be created'
        });

    }

});

router.put('/:id', async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {

        return res.status(500).json({
            error: error,
            message: 'Invalid product ID.',
            status: 500
        });

    }

    if (!category) {

        return res.status(404).json({
            error: `The category with id ${req.body.category} could not be found.`,
            success: false
        });

    }

    try {

        const category = await Category.findById(req.body.category);

        if (!category) {

            return res.status(404).json({
                error: `The category with id ${req.body.category} could not be found.`,
                success: false
            });

        }

        let productFound = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        }, { new: true });

        if (!productFound) {

            return res.status(404).json({
                error: error,
                success: false,
                status: 404
            });

        }

    } catch (error) {

        res.status(500).json({
            error: error,
            success: false
        });

    }

});

router.delete('/:id', async (req, res) => {

    try {

        const productDeleted = await Product.findOneAndRemove(req.params.id);

        if (!productDeleted) {

            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });

        }

        return res.status(201).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: true,
            message: `There was an error in deleting the product with id ${req.params.id}`,
            error: error
        });

    }

});


module.exports = router;
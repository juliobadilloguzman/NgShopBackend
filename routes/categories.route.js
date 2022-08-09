const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {

    try {

        const categories = await Category.find();

        if (!categories) {

            return res.status(404).json({
                error: `There was an error in retrieving the categories.`,
                success: false
            });

        }

        return res.status(200).send(categories);

    } catch (error) {

       return  res.status(500).json({
            error: `There was an error in retrieving the categories.`,
            success: false
        });

    }

});

router.get(`/:id`, async (req, res) => {

    try {

        const category = await Category.findById(req.params.id);

        if (!category) {

            return res.status(404).json({
                error: `The category with id ${req.params.id} could not be found.`,
                success: false
            });

        }

        res.send(category);

    } catch (error) {

        return res.status(500).json({
            error: `There was an error in retrieving the category with id ${req.params.id}.`,
            success: false
        });

    }

});

router.post('/', async (req, res) => {

    let newCategory = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    try {

        const createdCategory = await newCategory.save();
        return res.status(201).send(createdCategory)

    } catch (error) {

        return res.status(500).json({
            error: error,
            message: `There was an error in creating the category`,
            success: false
        });

    }

});

router.put('/:id', async (req, res) => {

    try {

        let categoryFound = await Category.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        }, { new: true });

        if (!categoryFound) {

            return res.status(404).json({
                error: error,
                success: false,
                status: 404
            });

        }

        res.send(categoryFound);

    } catch (error) {

        return res.status(500).json({
            error: error,
            success: false
        });

    }

});

router.delete('/:id', async (req, res) => {

    try {

        const categoryDeleted = await Category.findOneAndRemove(req.params.id);

        if (!categoryDeleted) {

            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Category not found.'
            });

        }

        return res.status(201).json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            status: 500,
            message: `There was an error in deleting the category: ${error}`
        });

    }

});


module.exports = router;
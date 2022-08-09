const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get(`/`, async (req, res) => {

    try{

        const userList = await User.find().select('-passwordHash')

        if(!userList) {
            res.status(404).json({success: false})
        } 

        res.send(userList);

    }catch(error){

        res.status(500).json({
            error: error,
            message: `There was an error in retreiving the list of users.`,
            success: false
        });

    }

});

router.get(`/:id`, async (req, res) => {

    try{

        const userFound = await User.findById(req.params.id).select('-passwordHash')

        if(!userFound) {
            res.status(404).json({success: false})
        } 

        res.send(userFound);

    }catch(error){

        res.status(500).json({
            error: error,
            message: `There was an error in retreiving the user with id ${req.params.id}`,
            success: false
        });

    }

});

router.get(`/get/count`, async (req, res) => {

    try {

        const userCount = await User.countDocuments();
        res.send({count: userCount});

    } catch (error) {

        return res.status(500).json({
            message: `There was an error in retrieving the users count.`,
            error: error,
            success: false
        });

    }

});

router.post('/', async (req, res) => {

    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bycrypt.hashSync(req.body.password, 10),
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zipCode: req.body.zipCode,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin
    });

    try {

        const userCreated = await newUser.save();
        res.status(201).send(userCreated)

    } catch (error) {

        res.status(500).json({
            error: error,
            message: `The user cannot be created`,
            success: false
        });

    }

});

router.put('/:id', async (req, res) => {

    try {

        const userExists = await User.find(req.params.id);

        let newPassword;

        if(req.body.password){
            newPassword = bycrypt.hashSync(req.body.password);
        }else{
            newPassword = userExists.passwordHash;
        }

        let userFound = await User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            street: req.body.street,
            apartment: req.body.apartment,
            city: req.body.city,
            zipCode: req.body.zipCode,
            country: req.body.country,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin
        }, { new: true });

        if (!userFound) {

            return res.status(404).json({
                error: error,
                message: `The user cannot be found.`,
                status: 404
            });

        }

        res.send(userFound);

    } catch (error) {

        return res.status(500).json({
            error: error,
            success: false
        });

    }

});

router.post('/login', async(req, res) => {

    const user = await User.findOne({email: req.body.email});

    if(!user){

        return res.status(404).json({
            message: `The user cannot be found.`,
            status: 404
        });

    }

    if(!(user && bycrypt.compareSync(req.body.password, user.passwordHash))){

        res.status(400).json({
            message: `Password is wrong`,
            success: false
        });

    }

    const SECRET = process.env.SECRET;

    const token = jwt.sign(
        {
            userId: user.id,
            isAdmin: user.isAdmin
        },
        SECRET,
        {
            expiresIn: '1d'
        }
    );

    return res.send({user: user.email, token: token});

});

router.delete('/:id', async (req, res) => {

    try {

        const userDeleted = await User.findOneAndRemove(req.params.id);

        if (!userDeleted) {

            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });

        }

        return res.status(201).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: true,
            message: `There was an error in deleting the user with id ${req.params.id}`,
            error: error
        });

    }

});

module.exports = router;
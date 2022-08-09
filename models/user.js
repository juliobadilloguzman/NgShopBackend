const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: false
    },
    apartment: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    zipCode: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    phone: {
        type: Number,
        required: false
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
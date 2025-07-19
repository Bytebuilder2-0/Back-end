const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["customer", "technician", "manager", "supervisor"],
        default: "customer",
        technicianId: { type: String },
        managerId: { type: String },
        supervisorId: { type: String },

    },

    isDisabled: {
        type: Boolean,
        required: true,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        required: true,
        default: false,
    },                    // Additional fields for security and account management
        failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    unlockOtp: String,
    unlockOtpExpires: Date,
    mustChangePassword: {
        type: Boolean,
        default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,

}, { timestamps: true });

const Auth = mongoose.model('auth', userSchema);

module.exports = Auth;
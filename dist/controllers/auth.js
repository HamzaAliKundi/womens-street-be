"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = exports.getMe = exports.resetPassword = exports.sendForgotPasswordEmail = exports.verifyEmail = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importStar(require("../models/User"));
const env_1 = require("../config/env");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const emailService_1 = require("../utils/emailService");
const jwt_1 = require("../utils/jwt");
exports.register = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password, name, isEmailVerified } = req.body;
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser)
        res.status(400).json({ message: 'User already exists' });
    const salt = await bcryptjs_1.default.genSalt(env_1.env.SALT_ROUNDS);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    const user = await User_1.default.create({
        email,
        password: hashedPassword,
        name,
        isEmailVerified: isEmailVerified || false
    });
    const token = (0, jwt_1.generateVerificationToken)(user);
    await (0, emailService_1.sendVerificationEmail)(email, name, token);
    res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        status: 201,
        token,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        }
    });
});
exports.login = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }
    if (!user.isEmailVerified) {
        res.status(400).json({ message: 'Email not verified' });
        return;
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }
    const token = (0, jwt_1.generateToken)(user);
    res.status(200).json({
        message: 'Login successful',
        status: 200,
        token,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    });
});
exports.verifyEmail = (0, express_async_handler_1.default)(async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await User_1.default.findById(decoded._id);
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }
        if (user.isEmailVerified) {
            res.status(400).json({ message: 'Email already verified' });
            return;
        }
        user.isEmailVerified = true;
        await user.save();
        res.status(200).json({
            message: 'Email verified successfully',
            status: 200
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Token expired or invalid' });
        return;
    }
});
exports.sendForgotPasswordEmail = (0, express_async_handler_1.default)(async (req, res) => {
    const { email } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(400).json({ message: 'User not found' });
        return;
    }
    const token = (0, jwt_1.generateForgotPasswordToken)(user);
    await (0, emailService_1.sendPasswordResetEmail)(email, user === null || user === void 0 ? void 0 : user.name, token);
    res.status(200).json({
        message: 'Forgot password email sent successfully',
        status: 200
    });
});
exports.resetPassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { token, password } = req.body;
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await User_1.default.findById(decoded._id);
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(env_1.env.SALT_ROUNDS);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({
            message: 'Password reset successfully',
            status: 200
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Token expired or invalid' });
        return;
    }
});
exports.getMe = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    if (!user) {
        res.status(400).json({ message: 'User not found' });
        return;
    }
    res.status(200).json({
        message: 'User fetched successfully',
        status: 200,
        user
    });
});
// Create admin user (for testing purposes)
exports.createAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password, name } = req.body;
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }
    const salt = await bcryptjs_1.default.genSalt(env_1.env.SALT_ROUNDS);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    const user = await User_1.default.create({
        email,
        password: hashedPassword,
        name,
        role: User_1.UserRole.ADMIN,
        isEmailVerified: true
    });
    const token = (0, jwt_1.generateToken)(user);
    res.status(201).json({
        message: 'Admin user created successfully',
        status: 201,
        token,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        }
    });
});

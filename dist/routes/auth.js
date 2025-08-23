"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', auth_1.login);
router.post('/register', auth_1.register);
router.post('/verify-email', auth_1.verifyEmail);
router.post('/forgot-password', auth_1.sendForgotPasswordEmail);
router.post('/reset-password', auth_1.resetPassword);
router.post('/create-admin', auth_1.createAdmin); // For testing purposes
router.get('/me', auth_2.authMiddleware, auth_1.getMe);
exports.default = router;

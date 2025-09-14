"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const product_1 = __importDefault(require("./product"));
const cart_1 = __importDefault(require("./cart"));
const order_1 = __importDefault(require("./order"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/products', product_1.default);
router.use('/cart', cart_1.default); // Public cart routes
router.use('/order', order_1.default); // Public order routes
exports.default = router;

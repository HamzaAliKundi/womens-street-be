"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const User_1 = require("../models/User");
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        if (req.user.role !== User_1.UserRole.ADMIN) {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.adminMiddleware = adminMiddleware;

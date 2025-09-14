"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminOrderNotification = exports.sendOrderConfirmationEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const emailtemplate_1 = require("./emailtemplate");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: env_1.env.SMTP_USER,
        pass: env_1.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
const sendVerificationEmail = async (email, name, token) => {
    const verificationUrl = `${env_1.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = (0, emailtemplate_1.verificationEmailTemplate)({ name, verificationUrl });
    await transporter.sendMail({
        from: `"Women Street" <${env_1.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email',
        html
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `${env_1.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = (0, emailtemplate_1.resetPasswordTemplate)({ name, resetUrl });
    await transporter.sendMail({
        from: `"Women Street" <${env_1.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your Password',
        html
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// Order confirmation email to customer
const sendOrderConfirmationEmail = async (orderData) => {
    const { customerEmail, customerName, orderNumber, items, totalAmount, shippingCost, tax, finalTotal, customerDetails, createdAt } = orderData;
    // Format order date
    const orderDate = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    // Format items with totals
    const formattedItems = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        itemTotal: (item.price * item.quantity).toFixed(2)
    }));
    const html = (0, emailtemplate_1.orderConfirmationTemplate)({
        customerName,
        orderNumber,
        orderDate,
        items: formattedItems,
        subtotal: totalAmount.toFixed(2),
        shipping: shippingCost.toFixed(2),
        freeShipping: shippingCost === 0,
        tax: tax.toFixed(2),
        total: finalTotal.toFixed(2),
        address: customerDetails.address,
        nearbyPlace: customerDetails.nearbyPlace,
        city: customerDetails.city,
        postalCode: customerDetails.postalCode,
        phone: customerDetails.phone,
        notes: customerDetails.notes
    });
    await transporter.sendMail({
        from: `"Women Street" <${env_1.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Order Confirmation - ${orderNumber} | Women Street`,
        html
    });
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
// Admin notification email for new orders
const sendAdminOrderNotification = async (orderData) => {
    const { orderNumber, items, finalTotal, customerDetails, createdAt, guestId } = orderData;
    // Admin email addresses
    const adminEmails = [
        'hamza.alee83@gmail.com',
        'Saimather515@gmail.com',
        'shopwomenstreet@gmail.com',
        'faizanlashif21@gmail.com',
        'zishuniazi121@gmail.com'
    ];
    // Format order date
    const orderDate = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    // Format items with totals
    const formattedItems = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        itemTotal: (item.price * item.quantity).toFixed(2)
    }));
    const html = (0, emailtemplate_1.adminOrderNotificationTemplate)({
        orderNumber,
        orderDate,
        total: finalTotal.toFixed(2),
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        customerCity: customerDetails.city,
        address: customerDetails.address,
        nearbyPlace: customerDetails.nearbyPlace,
        city: customerDetails.city,
        postalCode: customerDetails.postalCode,
        notes: customerDetails.notes,
        items: formattedItems,
        guestId
    });
    // Send to all admin emails
    for (const adminEmail of adminEmails) {
        await transporter.sendMail({
            from: `"Women Street Admin Alert" <${env_1.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🚨 NEW ORDER ALERT - ${orderNumber} - PKR ${finalTotal.toFixed(2)}`,
            html
        });
    }
};
exports.sendAdminOrderNotification = sendAdminOrderNotification;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrderNotificationTemplate = exports.orderConfirmationTemplate = exports.resetPasswordTemplate = exports.verificationEmailTemplate = void 0;
const handlebars_1 = require("handlebars");
exports.verificationEmailTemplate = (0, handlebars_1.compile)(`
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { padding: 20px; font-family: Arial, sans-serif; }
        .button { 
            background-color: #4CAF50; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify Your Email</h2>
        <p>Hello {{name}},</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="{{verificationUrl}}" class="button">Verify Email</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
    </div>
</body>
</html>
`);
exports.resetPasswordTemplate = (0, handlebars_1.compile)(`
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { padding: 20px; font-family: Arial, sans-serif; }
        .button { 
            background-color: #4CAF50; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>Hello {{name}},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="{{resetUrl}}" class="button">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
    </div>
</body>
</html>
`);
exports.orderConfirmationTemplate = (0, handlebars_1.compile)(`
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto;
            background-color: #f9f9f9;
        }
        .header { 
            background-color: #e91e63; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
        }
        .content { 
            background-color: white; 
            padding: 20px; 
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .order-details { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0;
        }
        .item { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee;
        }
        .total { 
            font-weight: bold; 
            font-size: 18px; 
            color: #e91e63; 
            padding-top: 10px;
            border-top: 2px solid #e91e63;
        }
        .footer { 
            text-align: center; 
            margin-top: 20px; 
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛍️ Women Street</h1>
            <h2>Order Confirmation</h2>
        </div>
        <div class="content">
            <p>Dear {{customerName}},</p>
            <p>Thank you for your order! We're excited to confirm that we've received your order.</p>
            
            <div class="order-details">
                <h3>📋 Order Details</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Payment Method:</strong> Cash on Delivery</p>
            </div>

            <div class="order-details">
                <h3>🛒 Items Ordered</h3>
                {{#each items}}
                <div class="item">
                    <span>{{name}} (x{{quantity}})</span>
                    <span>PKR {{itemTotal}}</span>
                </div>
                {{/each}}
                
                <div class="item">
                    <span>Subtotal:</span>
                    <span>PKR {{subtotal}}</span>
                </div>
                <div class="item">
                    <span>Shipping:</span>
                    <span>{{#if freeShipping}}Free{{else}}PKR {{shipping}}{{/if}}</span>
                </div>
                <div class="item">
                    <span>Tax (8%):</span>
                    <span>PKR {{tax}}</span>
                </div>
                <div class="item total">
                    <span>Total Amount:</span>
                    <span>PKR {{total}}</span>
                </div>
            </div>

            <div class="order-details">
                <h3>🚚 Delivery Address</h3>
                <p><strong>{{customerName}}</strong></p>
                <p>{{address}}</p>
                <p>Near: {{nearbyPlace}}</p>
                <p>{{city}}, {{postalCode}}</p>
                <p>Phone: {{phone}}</p>
                {{#if notes}}
                <p><strong>Special Instructions:</strong> {{notes}}</p>
                {{/if}}
            </div>

            <div class="order-details">
                <h3>📞 What's Next?</h3>
                <p>✅ Your order has been placed successfully</p>
                <p>📞 We will call you within 24 hours for order confirmation</p>
                <p>🚚 Expected delivery: 2-5 business days</p>
                <p>💰 Payment: Cash on Delivery</p>
            </div>

            <p>If you have any questions about your order, please contact us:</p>
            <p>📧 Email: shopwomenstreet@gmail.com</p>
            <p>📱 Phone: +92 300 1234567</p>

            <div class="footer">
                <p>Thank you for shopping with Women Street! 💖</p>
                <p><em>Your trusted fashion destination</em></p>
            </div>
        </div>
    </div>
</body>
</html>
`);
exports.adminOrderNotificationTemplate = (0, handlebars_1.compile)(`
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto;
        }
        .header { 
            background-color: #dc3545; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0;
        }
        .content { 
            background-color: white; 
            padding: 20px; 
            border: 1px solid #ddd;
            border-radius: 0 0 8px 8px;
        }
        .order-details { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0;
        }
        .item { 
            display: flex; 
            justify-content: space-between; 
            padding: 5px 0; 
            border-bottom: 1px solid #eee;
        }
        .urgent { 
            background-color: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0;
        }
        .total { 
            font-weight: bold; 
            font-size: 16px; 
            color: #dc3545; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 NEW ORDER ALERT</h1>
            <h2>Women Street Admin</h2>
        </div>
        <div class="content">
            <div class="urgent">
                <h3>⚡ URGENT: New Order Received!</h3>
                <p>A new order has been placed and requires immediate attention.</p>
            </div>

            <div class="order-details">
                <h3>📋 Order Information</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Order Value:</strong> PKR {{total}}</p>
                <p><strong>Payment:</strong> Cash on Delivery</p>
            </div>

            <div class="order-details">
                <h3>👤 Customer Details</h3>
                <p><strong>Name:</strong> {{customerName}}</p>
                <p><strong>Email:</strong> {{customerEmail}}</p>
                <p><strong>Phone:</strong> {{customerPhone}}</p>
                <p><strong>City:</strong> {{customerCity}}</p>
            </div>

            <div class="order-details">
                <h3>📍 Delivery Address</h3>
                <p>{{address}}</p>
                <p>Near: {{nearbyPlace}}</p>
                <p>{{city}}, {{postalCode}}</p>
                {{#if notes}}
                <p><strong>Special Instructions:</strong> {{notes}}</p>
                {{/if}}
            </div>

            <div class="order-details">
                <h3>🛒 Items Ordered</h3>
                {{#each items}}
                <div class="item">
                    <span>{{name}} (x{{quantity}})</span>
                    <span>PKR {{itemTotal}}</span>
                </div>
                {{/each}}
                <div class="item total">
                    <span>Total Amount:</span>
                    <span>PKR {{total}}</span>
                </div>
            </div>

            <div class="urgent">
                <h3>🎯 Action Required:</h3>
                <p>1. ✅ Verify stock availability</p>
                <p>2. 📞 Call customer within 24 hours: {{customerPhone}}</p>
                <p>3. 📦 Prepare order for shipment</p>
                <p>4. 📧 Update customer on delivery timeline</p>
            </div>

            <p><strong>Guest ID:</strong> {{guestId}}</p>
            <p><em>Login to admin panel to manage this order.</em></p>
        </div>
    </div>
</body>
</html>
`);

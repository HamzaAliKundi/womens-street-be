import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { verificationEmailTemplate, resetPasswordTemplate, orderConfirmationTemplate, adminOrderNotificationTemplate } from './emailtemplate';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false 
  }
});

export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<void> => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = verificationEmailTemplate({ name, verificationUrl });

  await transporter.sendMail({
    from: `"Women Street" <${env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email',
    html
  });
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = resetPasswordTemplate({ name, resetUrl });

  await transporter.sendMail({
    from: `"Women Street" <${env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html
  });
};

// Order confirmation email to customer
export const sendOrderConfirmationEmail = async (orderData: any): Promise<void> => {
  const {
    customerEmail,
    customerName,
    orderNumber,
    items,
    totalAmount,
    shippingCost,
    tax,
    finalTotal,
    customerDetails,
    createdAt
  } = orderData;

  // Format order date
  const orderDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format items with totals
  const formattedItems = items.map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    itemTotal: (item.price * item.quantity).toFixed(2)
  }));

  const html = orderConfirmationTemplate({
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
    from: `"Women Street" <${env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation - ${orderNumber} | Women Street`,
    html
  });
};

// Admin notification email for new orders
export const sendAdminOrderNotification = async (orderData: any): Promise<void> => {
  const {
    orderNumber,
    items,
    finalTotal,
    customerDetails,
    createdAt,
    guestId
  } = orderData;

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
  const formattedItems = items.map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    itemTotal: (item.price * item.quantity).toFixed(2)
  }));

  const html = adminOrderNotificationTemplate({
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
      from: `"Women Street Admin Alert" <${env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🚨 NEW ORDER ALERT - ${orderNumber} - PKR ${finalTotal.toFixed(2)}`,
      html
    });
  }
};

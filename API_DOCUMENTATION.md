# Women's Street Store API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
```
POST /auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```
POST /auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Admin User (for testing)
```
POST /auth/create-admin
```
**Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Get Current User
```
GET /auth/me
```
**Headers:**
```
Authorization: Bearer <token>
```

### Verify Email
```
POST /auth/verify-email
```
**Body:**
```json
{
  "token": "verification_token"
}
```

### Forgot Password
```
POST /auth/forgot-password
```
**Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```
POST /auth/reset-password
```
**Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

## Product Endpoints

### Get All Products
```
GET /products
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `brand` (optional): Filter by brand
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `search` (optional): Search in name, description, category, brand
- `featured` (optional): Filter featured products (true/false)

### Get Featured Products
```
GET /products/featured
```
**Query Parameters:**
- `limit` (optional): Number of products (default: 8)

### Search Products
```
GET /products/search?q=search_term
```
**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Products by Category
```
GET /products/category/:category
```
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Single Product
```
GET /products/:id
```

### Create Product (Admin Only)
```
POST /products
```
**Headers:**
```
Authorization: Bearer <admin_token>
```
**Body:**
```json
{
  "name": "Women's Summer Dress",
  "description": "Beautiful summer dress for women",
  "price": 89.99,
  "originalPrice": 99.99,
  "category": "Dresses",
  "subcategory": "Summer Dresses",
  "brand": "Fashion Brand",
  "images": ["image1.jpg", "image2.jpg"],
  "sizes": ["XS", "S", "M", "L", "XL"],
  "colors": ["Red", "Blue", "Black"],
  "stockQuantity": 50,
  "tags": ["summer", "dress", "casual"],
  "featured": true,
  "discount": 10
}
```

### Update Product (Admin Only)
```
PUT /products/:id
```
**Headers:**
```
Authorization: Bearer <admin_token>
```
**Body:** (same as create, but all fields are optional)

### Delete Product (Admin Only)
```
DELETE /products/:id
```
**Headers:**
```
Authorization: Bearer <admin_token>
```

## User Roles

- **USER**: Regular customer (default)
- **ADMIN**: Administrator with full access to product management

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "status": 400
}
```

## Success Responses

Successful responses include a message and status:

```json
{
  "message": "Operation successful",
  "status": 200,
  "data": {...}
}
```

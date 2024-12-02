##### **- Add this root URL before each endpoint to access the deployed server**

It might take some time to load due to Render's free tier limitation
**(https://ecommerce-api-e7iw.onrender.com)**

---

# Ecommerce API Documentation

#### Endpoints:
1. **Auth:**
   - **Register User:** `/api/v1/auth/register`
   - **Login User:** `/api/v1/auth/login`
   - **Logout User:** `/api/v1/auth/logout`
   - **Verify Email:** `/api/v1/auth/verify-email`
   - **Reset Password:** `/api/v1/auth/reset-password`
   - **Forgot Password:** `/api/v1/auth/forgot-password`

2. **Users:**
   - **Get All Users:** `/api/v1/users/`
   - **Get Single User:** `/api/v1/users/:id`
   - **Show Current User:** `/api/v1/users/showMe`
   - **Update User:** `/api/v1/users/updateUser`
   - **Update User Password:** `/api/v1/users/updateUserPassword`

3. **Products:**
   - **Get All Products:** `/api/v1/products/`
   - **Get Single Product:** `/api/v1/products/:id`
   - **Create Product:** `/api/v1/products/`
   - **Update Product:** `/api/v1/products/:id`
   - **Delete Product:** `/api/v1/products/:id`
   - **Upload Image:** `/api/v1/products/uploadImage`
   - **Get Product Reviews:** `/api/v1/products/:id/reviews`

4. **Reviews:**
   - **Get All Reviews:** `/api/v1/reviews`
   - **Get Single Review:** `/api/v1/reviews/:id`
   - **Create Review:** `/api/v1/reviews/`
   - **Update Review:** `/api/v1/reviews/:id`
   - **Delete Review:** `/api/v1/reviews/:id`

5. **Orders:**
   - **Get All Orders:** `/api/v1/orders/`
   - **Get Single Order:** `/api/v1/orders/:id`
   - **Get Current User Orders:** `/api/v1/orders/showAllMyOrders`
   - **Create Order:** `/api/v1/orders/`
   - **Update Order:** `/api/v1/orders/:id`

## Endpoints Documentation

### Auth Endpoints

1. **Register User:** `/api/v1/auth/register`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "test",
    "email": "test1@mail.com",
    "password": "12345678"
  }
  ```

2. **Login User:** `/api/v1/auth/login`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "admin@mail.com",
    "password": "12345678"
  }
  ```

3. **Logout User:** `/api/v1/auth/logout`
- **Method:** DELETE
- **Request Headers:**
  - None required

4. **Verify Email:** `/api/v1/auth/verify-email`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "verificationToken": "token",
    "email": "test1@mail.com"
  }
  ```

5. **Reset Password:** `/api/v1/auth/reset-password`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "test1@mail.com",
    "password": "newPassword",
    "token": "token"
  }
  ```

6. **Forgot Password:** `/api/v1/auth/forgot-password`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "test1@mail.com"
  }
  ```

### User Endpoints

1. **Get All Users:** `/api/v1/users/`
- **Method:** GET
- **Request Headers:**
  - None required

2. **Get Single User:** `/api/v1/users/:id`
- **Method:** GET
- **Request Headers:**
  - None required

3. **Show Current User:** `/api/v1/users/showMe`
- **Method:** GET
- **Request Headers:**
  - None required

4. **Update User:** `/api/v1/users/updateUser`
- **Method:** PATCH
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "test2",
    "email": "test2@mail.com"
  }
  ```

5. **Update User Password:** `/api/v1/users/updateUserPassword`
- **Method:** PATCH
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "oldPassword": "123456",
    "newPassword": "1234567"
  }
  ```

### Product Endpoints

1. **Get All Products:** `/api/v1/products/`
- **Method:** GET
- **Request Headers:**
  - None required

2. **Get Single Product:** `/api/v1/products/:id`
- **Method:** GET
- **Request Headers:**
  - None required

3. **Create Product:** `/api/v1/products/`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "accent chair",
    "price": 25999,
    "image": "https://example.com/image.jpg",
    "colors": ["#ff0000", "#00ff00", "#0000ff"],
    "company": "marcos",
    "description": "Product description",
    "category": "office"
  }
  ```

4. **Update Product:** `/api/v1/products/:id`
- **Method:** PATCH
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "updated accent chair"
  }
  ```

5. **Delete Product:** `/api/v1/products/:id`
- **Method:** DELETE
- **Request Headers:**
  - None required

6. **Upload Image:** `/api/v1/products/uploadImage`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: multipart/form-data`
- **Request Body:**
  - Form data with key "myImage" and file value

7. **Get Product Reviews:** `/api/v1/products/:id/reviews`
- **Method:** GET
- **Request Headers:**
  - None required

### Review Endpoints

1. **Get All Reviews:** `/api/v1/reviews`
- **Method:** GET
- **Request Headers:**
  - None required

2. **Get Single Review:** `/api/v1/reviews/:id`
- **Method:** GET
- **Request Headers:**
  - None required

3. **Create Review:** `/api/v1/reviews/`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "product": "product_id",
    "title": "Review Title",
    "comment": "Review Comment",
    "rating": 5
  }
  ```

4. **Update Review:** `/api/v1/reviews/:id`
- **Method:** PATCH
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "product": "product_id",
    "title": "Updated Review Title",
    "comment": "Updated Review Comment",
    "rating": 4
  }
  ```

5. **Delete Review:** `/api/v1/reviews/:id`
- **Method:** DELETE
- **Request Headers:**
  - None required

### Order Endpoints

1. **Get All Orders:** `/api/v1/orders/`
- **Method:** GET
- **Request Headers:**
  - None required

2. **Get Single Order:** `/api/v1/orders/:id`
- **Method:** GET
- **Request Headers:**
  - None required

3. **Get Current User Orders:** `/api/v1/orders/showAllMyOrders`
- **Method:** GET
- **Request Headers:**
  - None required

4. **Create Order:** `/api/v1/orders/`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "tax": 499,
    "shippingFee": 799,
    "items": [
      {
        "name": "accent chair",
        "price": 25999,
        "amount": 3,
        "product": "productId"
      }
    ]
  }
  ```

5. **Update Order:** `/api/v1/orders/:id`
- **Method:** PATCH
- **Request Headers:**
  - `Content-Type: application/json`

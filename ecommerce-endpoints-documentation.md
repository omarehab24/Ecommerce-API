##### **- Add this root URL before each endpoint to access the deployed server**

It might take some time to load due to Render's free tier limitation
**(https://ecommerce-api-e7iw.onrender.com)**

---

# Ecommerce API Documentation

#### Endpoints:
1. **Auth:**
   - **Register User:** `/auth/register`
   - **Login User:** `/auth/login`
   - **Logout User:** `/auth/logout`
   - **Verify Email:** `/auth/verify-email`
   - **Reset Password:** `/auth/reset-password`
   - **Forgot Password:** `/auth/forgot-password`

2. **Users:**
   - **Get All Users:** `/users/`
   - **Get Single User:** `/users/:id`
   - **Show Current User:** `/users/showMe`
   - **Update User:** `/users/updateUser`
   - **Update User Password:** `/users/updateUserPassword`

3. **Products:**
   - **Get All Products:** `/products/`
   - **Get Single Product:** `/products/:id`
   - **Create Product:** `/products/`
   - **Update Product:** `/products/:id`
   - **Delete Product:** `/products/:id`
   - **Upload Image:** `/products/uploadImage`
   - **Get Product Reviews:** `/products/:id/reviews`

4. **Reviews:**
   - **Get All Reviews:** `/reviews`
   - **Get Single Review:** `/reviews/:id`
   - **Create Review:** `/reviews/`
   - **Update Review:** `/reviews/:id`
   - **Delete Review:** `/reviews/:id`

5. **Orders:**
   - **Get All Orders:** `/orders/`
   - **Get Single Order:** `/orders/:id`
   - **Get Current User Orders:** `/orders/showAllMyOrders`
   - **Create Order:** `/orders/`
   - **Update Order:** `/orders/:id`

## Endpoints Documentation

### Auth Endpoints

1. **Register User:** `/auth/register`
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

2. **Login User:** `/auth/login`
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

3. **Logout User:** `/auth/logout`
- **Method:** DELETE
- **Request Headers:**
  - None required

4. **Verify Email:** `/auth/verify-email`
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

5. **Reset Password:** `/auth/reset-password`
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

6. **Forgot Password:** `/auth/forgot-password`
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

1. **Get All Users:** `/users/`
- **Method:** GET
- **Request Headers:**
  - None required

2. **Get Single User:** `/users/:id`
- **Method:** GET
- **Request Headers:**
  - None required

3. **Show Current User:** `/users/showMe`
- **Method:** GET
- **Request Headers:**
  - None required

4. **Update User:** `/users/updateUser`
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

5. **Update User Password:** `/users/updateUserPassword`
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

1. **Get All Products:** `/products/`
- **Method:** GET
- **Request Headers:**
  - None required

2. **Get Single Product:** `/products/:id`
- **Method:** GET
- **Request Headers:**
  - None required

3. **Create Product:** `/products/`
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

4. **Update Product:** `/products/:id`
- **Method:** PATCH
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "updated accent chair"
  }
  ```

5. **Delete Product:** `/products/:id`
- **Method:** DELETE
- **Request Headers:**
  - None required

6. **Upload Image:** `/products/uploadImage`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: multipart/form-data`
- **Request Body:**
  - Form data with key "myImage" and file value

7. **Get Product Reviews:** `/products/:id/reviews`
- **Method:** GET
- **Request Headers:**
  - None required

### Review Endpoints

1. **Get All Reviews:** `/reviews`
- **Method:** GET
- **Request Headers:**
  - None required

2. **Get Single Review:** `/reviews/:id`
- **Method:** GET
- **Request Headers:**
  - None required

3. **Create Review:** `/reviews/`
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

4. **Update Review:** `/reviews/:id`
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

5. **Delete Review:** `/reviews/:id`
- **Method:** DELETE
- **Request Headers:**
  - None required

### Order Endpoints

1. **Get All Orders:** `/orders/`
- **Method:** GET
- **Request Headers:**
  - None required

2. **Get Single Order:** `/orders/:id`
- **Method:** GET
- **Request Headers:**
  - None required

3. **Get Current User Orders:** `/orders/showAllMyOrders`
- **Method:** GET
- **Request Headers:**
  - None required

4. **Create Order:** `/orders/`
- **Method:** POST
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "tax": 399,
    "shippingFee": 499,
    "items": [
      {
        "name": "accent chair",
        "price": 2599,
        "image": "https://example.com/image.jpg",
        "amount": 3,
        "product": "product_id"
      }
    ]
  }
  ```

5. **Update Order:** `/orders/:id`
- **Method:** PATCH
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "paymentID": "RandomID"
  }
  ```

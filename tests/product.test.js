const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const supertest = require('supertest');
const api = supertest(app);
const helper = require('../utils/test_helper');

// Tested Endpoints:
// GET /api/v1/products/
// GET /api/v1/products/:id
// POST /api/v1/products/
// PATCH /api/v1/products/:id
// DELETE /api/v1/products/:id
// POST /api/v1/products/uploadImage
// GET /api/v1/products/:id/reviews

// Test variables
let admin;
let adminAccessToken;
let user;
let userAccessToken;
let initialProductCreated

beforeEach(async () => {
  const adminSetup = await helper.setupTestDbAdmin(api);
  admin = adminSetup.admin;
  adminAccessToken = adminSetup.adminAccessToken;

  const userSetup = await helper.setupTestDbUser(api);
  user = userSetup.user;
  userAccessToken = userSetup.userAccessToken;

  initialProductCreated = await helper.createTestProduct(admin.id);
  
  
});

after(helper.closeDbConnection)


describe("Product Tests", async () => {

 describe("GET /api/v1/products", async () => {
  test("should get all products", async () => {
    const response = await api
      .get("/api/v1/products")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(200);

    assert.equal(response.body.products.length, 1);
    assert.equal(response.body.products[0].name, initialProductCreated.name);
    assert.equal(response.body.products[0].price, initialProductCreated.price);
  });
 });

 //  =====================================================================  //

 describe("GET /api/v1/products/:id", async () => {

  test("should get single product", async () => {
    const response = await api
      .get(`/api/v1/products/${initialProductCreated._id}`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(200);

    assert.equal(response.body.product.name, initialProductCreated.name);
    assert.equal(response.body.product.price, initialProductCreated.price);
  });

  test("should not get product that doesn't exist", async () => {
    const response = await api
      .get(`/api/v1/products/invalid-id`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(404);
  });
 });

 //  =====================================================================  //

 describe("POST /api/v1/products", async () => {
  const newProduct = {
    name: "New Product",
    price: 9.99,
    description: "This is a new product",
    category: "office",
    image: "https://example.com/image.jpg",
    colors: ["#ff0000", "#00ff00", "#0000ff"],
  company: "marcos",
  id: "123456789012345678901235",
  };
  test("should create product", async () => {
    const response = await api
      .post("/api/v1/products")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send(newProduct)
      .expect(201);

    assert.equal(response.body.product.name, newProduct.name);
    assert.equal(response.body.product.price, newProduct.price);
  });

  test("should not create product with missing fields", async () => {
    const response = await api
      .post("/api/v1/products")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send({})
      .expect(400);
  });

  test("category should be either office, bedroom or kitchen", async () => {
    const response = await api
      .post("/api/v1/products")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send({...newProduct, category: "invalid"})
      .expect(400);
  });

  test("company should be either marcos, ikea or liddy", async () => {
    const response = await api
      .post("/api/v1/products")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send({...newProduct, company: "invalid"})
      .expect(400);
  });

  test("should not create product as a user", async () => {
    const response = await api
      .post("/api/v1/products")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send(newProduct)
      .expect(403);
  });

});

//  =====================================================================  //

describe("PATCH /api/v1/products/:id", async () => {
  const updatedProduct = {
    name: "Updated Product",
    price: 19.99,
    description: "This is an updated product",
    category: "kitchen",
    image: "https://example.com/image.jpg",
    colors: ["#ff0000", "#00ff00", "#0000ff"],
  };

  test("should update product as an admin", async () => {
    const response = await api
      .patch(`/api/v1/products/${initialProductCreated._id}`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send(updatedProduct)
      .expect(200);

    assert.equal(response.body.product.name, updatedProduct.name);
    assert.equal(response.body.product.price, updatedProduct.price);
  });

  test("should not update product as a user", async () => {
    const response = await api
      .patch(`/api/v1/products/${initialProductCreated._id}`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send(updatedProduct)
      .expect(403);
  });

  test("should not update product that doesn't exist", async () => {
    const response = await api
      .patch(`/api/v1/products/invalid-id`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send(updatedProduct)
      .expect(404);
  });


});

//  =====================================================================  //

describe("DELETE /api/v1/products/:id", async () => {
  test("should delete product as an admin", async () => {
    const response = await api
      .delete(`/api/v1/products/${initialProductCreated._id}`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send()
      .expect(200);

    assert.equal(response.body.msg, "Product deleted successfully!");

  });

  test("should not delete product as a user", async () => {
    const response = await api
      .delete(`/api/v1/products/${helper.initialProduct._id}`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(403);
  });

  test("should not delete product that doesn't exist", async () => {
    const response = await api
      .delete(`/api/v1/products/invalid-id`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send()
      .expect(404);
  });


});

//  =====================================================================  //

describe("POST /api/v1/products/uploadImage", async () => {

  test("should upload image successfully", async () => {
    const response = await api
      .post(`/api/v1/products/uploadImage`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .attach('myImage', 'tests/test-image.jpeg')
      .expect(201);

    assert.ok(response.body.image.startsWith('/uploads/'));
  });

  test("should not upload non-image file", async () => {
    const response = await api
      .post(`/api/v1/products/uploadImage`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .attach('myImage', 'package.json')
      .expect(400);
  });

  test("should not upload without file", async () => {
    const response = await api
      .post(`/api/v1/products/uploadImage`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .expect(400);
  });

  test("should not upload as a user", async () => {
    const response = await api
      .post(`/api/v1/products/uploadImage`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .expect(403);
  });
});

//  =====================================================================  //

describe("GET /api/v1/products/:id/reviews", async () => {
  test("should get product reviews", async () => {
    const response = await api
      .get(`/api/v1/products/${initialProductCreated._id}/reviews`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(200);

      // Currently no reviews
    assert.equal(response.body.reviews.length, 0);
  });

});

//  =====================================================================  //




})
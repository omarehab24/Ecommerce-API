const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);
const helper = require("../utils/test_helper");

// Tested Endpoints:
// GET /api/v1/orders
// GET /api/v1/orders/:id
// GET /api/v1/orders/showAllMyOrders
// POST /api/v1/orders
// PATCH /api/v1/orders/:id

// Test variables
let admin;
let adminAccessToken;
let user;
let userAccessToken;
let initialProductCreated;
let initialOrderCreated;

beforeEach(async () => {
  const adminSetup = await helper.setupTestDbAdmin(api);
  admin = adminSetup.admin;
  adminAccessToken = adminSetup.adminAccessToken;

  initialProductCreated = await helper.createTestProduct(admin.id);

  const userSetup = await helper.setupTestDbUser(api);
  user = userSetup.user;
  userAccessToken = userSetup.userAccessToken;

  initialOrderCreated = await helper.createTestOrder(
    user.id,
    initialProductCreated._id
  );
});

after(helper.closeDbConnection);

describe("Order Tests", async () => {

  describe("GET /api/v1/orders", async () => {
    test("Should return all orders as an admin", async () => {
      const response = await api
        .get("/api/v1/orders")
        .set("User-Agent", "test-agent")
        .set("X-Forwarded-For", "127.0.0.1")
        .set("Cookie", `accessToken=${adminAccessToken}`)
        .send()
        .expect(200);
    });

    test("Should not return all orders as a user", async () => {
      const response = await api
        .get("/api/v1/orders")
        .set("User-Agent", "test-agent")
        .set("X-Forwarded-For", "127.0.0.1")
        .set("Cookie", `accessToken=${userAccessToken}`)
        .send()
        .expect(403);
    });
  });

    //  =====================================================================  //


  describe("GET /api/v1/orders/:id", async () => {
    test("Should return a single order as a user", async () => {
      const response = await api
        .get(`/api/v1/orders/${initialOrderCreated._id}`)
        .set("User-Agent", "test-agent")
        .set("X-Forwarded-For", "127.0.0.1")
        .set("Cookie", `accessToken=${userAccessToken}`)
        .send()
        .expect(200);
    });

    test("should not return an order that doesn't exist", async () => {
      const response = await api
        .get(`/api/v1/orders/invalid-id`)
        .set("User-Agent", "test-agent")
        .set("X-Forwarded-For", "127.0.0.1")
        .set("Cookie", `accessToken=${userAccessToken}`)
        .send()
        .expect(404);
    });
  });

    //  =====================================================================  //


describe("GET /api/v1/orders/showAllMyOrders", async () => {
  test("Should return all orders for a user", async () => {
    const response = await api
      .get("/api/v1/orders/showAllMyOrders")
      .set("User-Agent", "test-agent")
      .set("X-Forwarded-For", "127.0.0.1")
      .set("Cookie", `accessToken=${userAccessToken}`)
      .send()
      .expect(200);

    assert.equal(response.body.orders.length, 1);
  });
});

  //  =====================================================================  //

describe("POST /api/v1/orders", async () => {
  test("Should create an order as a user", async () => {
    const newOrder = {
      tax: 399,
      shippingFee: 499,
      items: [
        {
          name: initialProductCreated.name,
          price: initialProductCreated.price,
          image: initialProductCreated.image,
          amount: 3,
          product: initialProductCreated._id,
        },
      ],
    };
    const response = await api
      .post("/api/v1/orders")
      .set("User-Agent", "test-agent")
      .set("X-Forwarded-For", "127.0.0.1")
      .set("Cookie", `accessToken=${userAccessToken}`)
      .send(newOrder)
      .expect(201);
  });

  test("should not create an order with missing fields", async () => {
    const response = await api
      .post("/api/v1/orders")
      .set("User-Agent", "test-agent")
      .set("X-Forwarded-For", "127.0.0.1")
      .set("Cookie", `accessToken=${userAccessToken}`)
      .send({})
      .expect(400);
  });

});

  //  =====================================================================  //

describe("PATCH /api/v1/orders/:id", async () => {
  test("Should update an order as a user", async () => {
    const updatedOrder = {
      tax: 399,
      shippingFee: 499,
      items: [
        {
          name: initialProductCreated.name,
          price: initialProductCreated.price,
          image: initialProductCreated.image,
          amount: 2,
          product: initialProductCreated._id,
        },
      ],
    };
    const response = await api
      .patch(`/api/v1/orders/${initialOrderCreated._id}`)
      .set("User-Agent", "test-agent")
      .set("X-Forwarded-For", "127.0.0.1")
      .set("Cookie", `accessToken=${userAccessToken}`)
      .send(updatedOrder)
      .expect(200);
  });
});

  //  =====================================================================  //

});

const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const supertest = require('supertest');
const api = supertest(app);
const helper = require('../utils/test_helper');;

// Tested Endpoints:
// GET /api/v1/reviews
// GET /api/v1/reviews/:id
// POST /api/v1/reviews
// PATCH /api/v1/reviews/:id
// DELETE /api/v1/reviews/:id

// Test variables
let admin;
let adminAccessToken;
let user;
let userAccessToken;
let initialProductCreated
let initialReviewCreated
let user2;
let user2AccessToken;

beforeEach(async () => {
    const adminSetup = await helper.setupTestDbAdmin(api);
    admin = adminSetup.admin;
    adminAccessToken = adminSetup.adminAccessToken;

    initialProductCreated = await helper.createTestProduct(admin.id);
  
    const userSetup = await helper.setupTestDbUser(api);
    user = userSetup.user;
    userAccessToken = userSetup.userAccessToken;

    initialReviewCreated = await helper.createTestReview(initialProductCreated._id, user.id);

    const user2Setup = await helper.setupAnotherTestDbUser(api);
    user2 = user2Setup.user;
    user2AccessToken = user2Setup.userAccessToken;
    
  });

  after(helper.closeDbConnection)

  describe("Review Tests", async () => {

    describe("GET /api/v1/reviews", async () => {
      test("should get all reviews", async () => {
        const response = await api
          .get("/api/v1/reviews")
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${userAccessToken}`)
          .send()
          .expect(200);
  
        assert.equal(response.body.reviews.length, 1);
      });
    });

    //  =====================================================================  //

    describe("GET /api/v1/reviews/:id", async () => {
      test("should get single review", async () => {
        const response = await api
          .get(`/api/v1/reviews/${initialReviewCreated._id}`)
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${userAccessToken}`)
          .send()
          .expect(200);
      });

      test("should not get review that doesn't exist", async () => {
        const response = await api
          .get(`/api/v1/reviews/invalid-id`)
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${userAccessToken}`)
          .send()
          .expect(404);
      });
    });

    //  =====================================================================  //

    describe("POST /api/v1/reviews", async () => {
      test("should create review as a user", async () => {
        const newReview = {
          rating: 5,
          comment: "I love this product",
          title: "Great product",
          product: initialProductCreated._id,
        };
        const response = await api
          .post("/api/v1/reviews")
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${user2AccessToken}`)
          .send(newReview)
          .expect(201);
  
        assert.equal(response.body.review.rating, newReview.rating);
        assert.equal(response.body.review.comment, newReview.comment);
      });

      test("should create one review per user", async () => {
        const newReview = {
          rating: 5,
          comment: "I love this product",
          title: "Great product",
          product: initialProductCreated._id,
        };
        const response = await api
          .post("/api/v1/reviews")
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${userAccessToken}`)
          .send(newReview)
          .expect(400);
      });

      test("should not create review as a non-user", async () => {
        const newReview = {
          rating: 5,
          product: initialProductCreated._id,
        };
        const response = await api
          .post("/api/v1/reviews")
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .send(newReview)
          .expect(401);
      });

      test("should not create review with missing fields", async () => {
        const newReview = {
          rating: 5,
          comment: "I love this product",
          title: "Great product",
          product: initialProductCreated._id,
        };
        const response = await api
          .post("/api/v1/reviews")
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${userAccessToken}`)
          .send(newReview)
          .expect(400);
      });
    });

    //  =====================================================================  //

    describe("PATCH /api/v1/reviews/:id", async () => {
      test("should update review as a user", async () => {
        const updatedReview = {
          rating: 5,
          comment: "I love this product",
          title: "Great product",
        };
        const response = await api
          .patch(`/api/v1/reviews/${initialReviewCreated._id}`)
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${userAccessToken}`)
          .send(updatedReview)
          .expect(200);
  
        assert.equal(response.body.review.rating, updatedReview.rating);
        assert.equal(response.body.review.comment, updatedReview.comment);
      });

      test("should not update another user's review", async () => {
        const updatedReview = {
          rating: 5,
          comment: "I love this product",
          title: "Great product",
        };
        const response = await api
          .patch(`/api/v1/reviews/${initialReviewCreated._id}`)
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${user2AccessToken}`)
          .send(updatedReview)
          .expect(403);
      });

      test("should not update review with missing fields", async () => {
        const updatedReview = {
          rating: 5,
          comment: "I love this product",
        };
        const response = await api
          .patch(`/api/v1/reviews/${initialReviewCreated._id}`)
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${userAccessToken}`)
          .send(updatedReview)
          .expect(400);
      });

      test("should not update review that doesn't exist", async () => {
        const updatedReview = {
          rating: 5,
          comment: "I love this product",
          title: "Great product",
        };
        const response = await api
          .patch(`/api/v1/reviews/invalid-id`)
          .set('User-Agent', 'test-agent')
          .set('X-Forwarded-For', '127.0.0.1')
          .set('Cookie', `accessToken=${userAccessToken}`)
          .send(updatedReview)
          .expect(404);
      });
    });

    //  =====================================================================  //

  describe("DELETE /api/v1/reviews/:id", async () => {
    test("should delete review as a user", async () => {
      const response = await api
        .delete(`/api/v1/reviews/${initialReviewCreated._id}`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .set('Cookie', `accessToken=${userAccessToken}`)
        .send()
        .expect(200);
    });

    test("should not delete another user's review", async () => {
      const response = await api
        .delete(`/api/v1/reviews/${initialReviewCreated._id}`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .set('Cookie', `accessToken=${user2AccessToken}`)
        .send()
        .expect(403);
    });

    test("should not delete review that doesn't exist", async () => {
      const response = await api
        .delete(`/api/v1/reviews/invalid-id`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .set('Cookie', `accessToken=${userAccessToken}`)
        .send()
        .expect(404);
    });
  });

  //  =====================================================================  //

  })
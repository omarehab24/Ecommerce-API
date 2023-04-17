require("dotenv").config();
const request = require("supertest");
const session = require("supertest-session");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");

let authenticatedSession = session(app);
let userID = null;
let productID = null;
let reviewID = null;
let orderID = null;
let cookie = null;

beforeAll(async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await User.findByIdAndDelete({ _id: userID });
  await mongoose.connection.close();
});

// request(app)               ==> public requests only
// request(app) with cookie   ==> public requests and authenticated user requests
// authenticatedSession       ==> public requests and authenticated user requests

describe("GET request to the root", () => {
  // Jest method
  it("Should return a 200 status code", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  // Supertest method
  it("Should specify text in the content type header", () => {
    request(app)
      .get("/")
      .expect("Content-Type", /text/)
      .end((err, res) => {
        if (err) throw err;
      });
  });
});

// ============================================================= //

describe("Auth", () => {
  describe("POST request to /register", () => {
    it("should return a 201 status code when a user registers with his name, email and password", (done) => {
      request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "unit-test",
          email: "unit-test@gmail.com",
          password: "123456",
        })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          userID = res.body.user.userID;
          return done();
        });
    });

    it("Should return 400 if user registers with already registered email", () => {
      return request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "unit-test",
          email: "unit-test@gmail.com",
          password: "123456",
        })
        .expect(400);
    });

    it("Should specify json in the content type header", () => {
      return request(app)
        .post("/api/v1/auth/register")
        .expect("Content-Type", /json/);
    });

    it("Should return 400 if user registers with password less than 6 characters", () => {
      return request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "unit-test",
          email: "unit-test@gmail.com",
          password: "123",
        })
        .expect(400);
    });

    it("Should return 400 if user registers with invalid email", () => {
      return request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "unit-test",
          email: "unit-test#gmail.com",
          password: "123456",
        })
        .expect(400);
    });

    it("Should return 400 if user registers with an empty email/password", () => {
      return request(app)
        .post("/api/v1/auth/register")
        .send({ name: "unit-test", email: "", password: "123456" })
        .expect(400);
    });

    // ------------------ //

    describe("POST request to /login", () => {
      it("Should return a 200 status code when a user logins with his correct email and password", (done) => {
        request(app)
          .post("/api/v1/auth/login")
          .send({ email: "unit-test@gmail.com", password: "123456" })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            // Can use this with .set("Cookie", cookie) to authenticate user
            // cookie = res.header["set-cookie"];
            return done();
          });
      });

      it("should return a 401 status code when a user logins with an incorrect email/password", () => {
        return request(app)
          .post("/api/v1/auth/login")
          .send({ email: "wrong-unit-test@gmail.com", password: "123456" })
          .expect(401);
      });

      it("should return a 400 status code when a user logins with an empty email/password", () => {
        return request(app)
          .post("/api/v1/auth/login")
          .send({ email: "unit-test@gmail.com", password: "" })
          .expect(400);
      });
    });
  });
});

// ============================================================= //

describe("Requests of authenticated admin only", () => {
  // https://www.npmjs.com/package/supertest-session

  beforeAll(function (done) {
    authenticatedSession
      .post("/api/v1/auth/login")
      .send({ email: "admin@gmail.com", password: "123456" })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        userID = res.body.user.userID;
        cookie = res.header["set-cookie"];
        return done();
      });
  });

  describe("Users", () => {
    describe("GET request to /api/v1/users/", () => {
      it("Should return a 200 status code [Admin only]", (done) => {
        authenticatedSession.get("/api/v1/users").expect(200).end(done);
      });
    });
  });

  // ------------------ //

  describe("Products", () => {
    describe("POST request to /api/v1/products/ [Admin only]", () => {
      it("Should return 201 status code", (done) => {
        authenticatedSession
          .post("/api/v1/products/")
          .send({
            name: "test product",
            price: 1,
            image:
              "https://dl.airtable.com/.attachmentThumbnails/0be1af59cf889899b5c9abb1e4db38a4/d631ac52",
            colors: ["#000", "#ffb900"],
            company: "liddy",
            description: "Description",
            category: "kitchen",
          })
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            productID = res.body.product._id;
            return done();
          });
      });
    });

    describe("PATCH request to /api/v1/products/:id [Admin only]", () => {
      it("Should return 200 status code", () => {
        return authenticatedSession
          .patch(`/api/v1/products/${productID}`)
          .send({
            name: "test product 2",
          })
          .expect(200);
      });
    });

    describe("POST request to /api/v1/products/uploadImage [Admin only]", () => {
      it("Should return 201 status code", () => {
        return authenticatedSession
          .post("/api/v1/products/uploadImage")
          .attach("myImage", "C:/Users/Omar/Pictures/images/example.jpeg")
          .expect(201);
      });
    });
  });

  // ------------------ //

  describe("Orders", () => {
    describe("GET request to /api/v1/orders [Admin only]", () => {
      it("Should return 200 status code", () => {
        return authenticatedSession.get("/api/v1/orders").expect(200);
      });
    });
  });
});

// ============================================================= //

describe("Requests of authenticated user or admin", () => {
  beforeAll(function (done) {
    authenticatedSession
      .post("/api/v1/auth/login")
      .send({ email: "unit-test@gmail.com", password: "123456" })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        userID = res.body.user.userID;
        return done();
      });
  });

  // ------------------ //

  describe("Users", () => {
    describe("GET request to /api/v1/users/:id", () => {
      it("Should return a 200 status code, only if the admin made the request or the user requests to view his own account info", () => {
        return authenticatedSession.get(`/api/v1/users/${userID}`).expect(200);
      });
    });

    describe("GET request to /api/v1/users/showMe", () => {
      it("Should return a 200 status code", () => {
        return authenticatedSession.get("/api/v1/users/showMe").expect(200);
      });
    });

    describe("PATCH request to /api/v1/users/updateUser", () => {
      it("Should return 200 status code", () => {
        return authenticatedSession
          .patch("/api/v1/users/updateUser/")
          .send({ name: "unit-test2", email: "unit-test@gmail.com" })
          .expect(200);
      });
    });

    describe("PATCH request to /api/v1/users/updateUserPassword", () => {
      it("Should return 200 status code", () => {
        return authenticatedSession
          .patch("/api/v1/users/updateUserPassword/")
          .send({
            oldPassword: "123456",
            newPassword: "1234567",
          })
          .expect(200);
      });
    });
  });

  // ------------------ //

  describe("Products", () => {
    describe("GET request to /api/v1/products/", () => {
      it("Should return 200 status code", async () => {
        return request(app).get("/api/v1/products/").expect(200);
      });
    });

    describe("GET request to /api/v1/products/:id", () => {
      it("Should return 200 status code", async () => {
        return request(app).get(`/api/v1/products/${productID}`).expect(200);
      });
    });

    describe("GET request to /api/v1/products/:id/reviews", () => {
      it("Should return 200 status code", async () => {
        return request(app)
          .get(`/api/v1/products/${productID}/reviews`)
          .expect(200);
      });
    });
  });

  // ------------------ //

  describe("Reviews", () => {
    describe("POST request to /api/v1/reviews/", () => {
      it("Should return a 200 status code", (done) => {
        authenticatedSession
          .post("/api/v1/reviews/")
          .send({
            product: productID,
            title: "Test Review",
            comment: "Test Comment",
            rating: 1,
          })
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            reviewID = res.body.review._id;
            return done();
          });
      });
    });

    describe("GET request to /api/v1/reviews/", () => {
      it("Should return a 200 status code", () => {
        return request(app).get("/api/v1/reviews/").expect(200);
      });
    });

    describe("GET request to /api/v1/reviews/:id", () => {
      it("Should return a 200 status code", () => {
        return request(app).get(`/api/v1/reviews/${reviewID}`).expect(200);
      });
    });

    describe("PATCH request to /api/v1/reviews/:id", () => {
      it("Should return a 200 status code", () => {
        return authenticatedSession
          .patch(`/api/v1/reviews/${reviewID}`)
          .send({
            title: "Review Edit",
            comment: "Comment Edit",
            rating: 2,
          })
          .expect(200);
      });
    });

    describe("DELETE request to /api/v1/reviews/:id", () => {
      it("Should return a 200 status code", () => {
        return authenticatedSession
          .delete(`/api/v1/reviews/${reviewID}`)
          .expect(200);
      });
    });
  });

  // ------------------ //

  describe("Orders", () => {
    describe("POST request to /api/v1/orders/", () => {
      it("Should return a 201 status code", (done) => {
        authenticatedSession
          .post("/api/v1/orders/")
          .send({
            tax: 399,
            shippingFee: 499,
            items: [
              {
                name: "Test Order",
                price: 2599,
                image:
                  "https://dl.airtable.com/.attachmentThumbnails/e8bc3791196535af65f40e36993b9e1f/438bd160",
                amount: 3,
                product: productID,
              },
            ],
          })
          .expect(201)
          .end((err, res) => {
            if (err) return done(err);
            orderID = res.body.order._id;
            return done();
          });
      });
    });

    describe("PATCH request to /api/v1/orders/", () => {
      it("Should return a 200 status code", () => {
        return authenticatedSession
          .patch(`/api/v1/orders/${orderID}`)
          .send({
            tax: 399,
            shippingFee: 499,
            items: [
              {
                name: "Update Test Order",
                price: 2599,
                image:
                  "https://dl.airtable.com/.attachmentThumbnails/e8bc3791196535af65f40e36993b9e1f/438bd160",
                amount: 3,
                product: productID,
              },
            ],
          })
          .expect(200);
      });
    });

    describe("GET request to /api/v1/orders/:id", () => {
      it("Should return a 200 status code", () => {
        return authenticatedSession
          .get(`/api/v1/orders/${orderID}`)
          .expect(200);
      });
    });

    describe("GET request to /api/v1/orders/showAllMyOrders", () => {
      it("Should return a 200 status code", () => {
        return authenticatedSession
          .get("/api/v1/orders/showAllMyOrders")
          .expect(200);
      });
    });
  });

  describe("GET request to /logout", () => {
    it("Should return a 200 status code", () => {
      return authenticatedSession.get("/api/v1/auth/logout").expect(200);
    });
  });
});

// ============================================================= //

describe("Continue requests for authenticated admin", () => {
  describe("DELETE request to /api/v1/products/:id", () => {
    it("Should return 200 status code", () => {
      return request(app)
        .delete(`/api/v1/products/${productID}`)
        .set("Cookie", cookie)
        .expect(200);
    });
  });
});

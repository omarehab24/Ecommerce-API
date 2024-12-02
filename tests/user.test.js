const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const supertest = require('supertest');
const api = supertest(app);
const helper = require('../utils/test_helper');
const User = require('../models/User');

// Tested Endpoints:
// GET /api/v1/users
// GET /api/v1/users/:id
// GET /api/v1/users/showMe
// PATCH /api/v1/users/updateUser
// PATCH /api/v1/users/updateUserPassword

// Test variables
let admin;
let adminAccessToken;
let user;
let userAccessToken;

beforeEach(async () => {

  const adminSetup = await helper.setupTestDbAdmin(api);
  admin = adminSetup.admin;
  adminAccessToken = adminSetup.adminAccessToken;

  const userSetup = await helper.setupTestDbUser(api);
  user = userSetup.user;
  userAccessToken = userSetup.userAccessToken;
});

after(helper.closeDbConnection)

describe("User Tests", async () => {

// Get all users, admin isn't counted as a "user"
  describe("GET /api/v1/users", async () => {

    test("should get all users as an admin", async () => {
    const response = await api
      .get("/api/v1/users")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send()
      .expect(200);

    assert.equal(response.body.users.length, 1);
    assert.equal(response.body.users[0].name, user.name);
    assert.equal(response.body.users[0].email, user.email);
  });

  test("should not get all users as a user", async () => {
    const response = await api
      .get("/api/v1/users")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(403);
  });
 });

//  =====================================================================  //

 describe("GET /api/v1/users/:id", async () => {
  test("should get single user as an admin", async () => {
    const response = await api
      .get(`/api/v1/users/${user._id}`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${adminAccessToken}`)
      .send()
      .expect(200);

    assert.equal(response.body.user.name, user.name);
    assert.equal(response.body.user.email, user.email);
  });

  test("user can get their own profile", async () => {
    const response = await api
      .get(`/api/v1/users/${user._id}`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(200);
  });

  test("should not get other user profile", async () => {
    const response = await api
      .get(`/api/v1/users/${admin._id}`)
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(403);
  });
 });

 //  =====================================================================  //

describe("GET /api/v1/users/showMe", async () => {
  test("user can get their own profile", async () => {
    const response = await api
      .get("/api/v1/users/showMe")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send()
      .expect(200);
  });
});

//  =====================================================================  //

describe("PATCH /api/v1/users/updateUser", async () => {
  test("user can update their own profile", async () => {
    const updatedData = {
      name: "Updated User Name",
      email: "updated.user@example.com"
    };

    const response = await api
      .patch("/api/v1/users/updateUser")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send(updatedData)
      .expect(200);

    // Verify database was updated
    const updatedUser = await User.findById(user._id);
    assert.equal(updatedUser.name, updatedData.name);
    assert.equal(updatedUser.email, updatedData.email);
  });

  test("should not update user with missing email or name", async () => {
    const response = await api
      .patch("/api/v1/users/updateUser")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send({})
      .expect(400);

    assert.match(response.body.msg, /Please provide the requried values!/i);
  });
});

//  =====================================================================  //

describe("PATCH /api/v1/users/updateUserPassword", async () => {
  test("user can update their own password", async () => {
    const updatedData = {
      oldPassword: helper.initialUser.password, 
      newPassword: "newpassword123"
    };

    const response = await api
      .patch("/api/v1/users/updateUserPassword")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send(updatedData)
      .expect(200);

    assert.match(response.body.msg, /Password updated!/);

    // Verify we can login with new password
    const loginResponse = await api
      .post('/api/v1/auth/login')
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        email: helper.initialUser.email,
        password: updatedData.newPassword
      })
      .expect(200);

    assert.ok(loginResponse.headers['set-cookie']); 
  });

  test("should not update password with incorrect old password", async () => {
    const response = await api
      .patch("/api/v1/users/updateUserPassword")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send({
        oldPassword: "wrongpassword",
        newPassword: "newpassword123"
      })
      .expect(401);

    assert.match(response.body.msg, /Invalid Credentials/i);
  });

  test("should not update password with missing values", async () => {
    const response = await api
      .patch("/api/v1/users/updateUserPassword")
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .set('Cookie', `accessToken=${userAccessToken}`)
      .send({})
      .expect(400);

    assert.match(response.body.msg, /Please provide both oldPassword and newPassword/i);
  });
});

//  =====================================================================  //

})
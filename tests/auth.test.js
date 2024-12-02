const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const supertest = require('supertest');
const api = supertest(app);
const helper = require('../utils/test_helper');
const User = require('../models/User');

// Tested Endpoints:
// POST /api/v1/auth/test-register
// GET /api/v1/auth/verify-email
// POST /api/v1/auth/login
// DELETE /api/v1/auth/logout
// POST /api/v1/auth/test-forgot-password
// POST /api/v1/auth/reset-password

// Test variables
let admin;
let adminAccessToken;

beforeEach(async () => {
  // Initial user is created (admin)
  const adminSetup = await helper.setupTestDbAdmin(api);
  admin = adminSetup.admin;
  adminAccessToken = adminSetup.adminAccessToken;
});

after(helper.closeDbConnection)


describe('Authentication Tests', async () => {
  // In this case the test is for the /test-register endpoint, not the /register endpoint, but the logic is the same, except for send "email verification" email part, the email verification is tested in the /verify-email endpoint
  describe('POST /api/v1/auth/test-register', async () => {

    test('Initial user should be an admin', async () => {
      assert(admin.role === 'admin');
    });

    test('should register a new user successfully', async () => {
      const testUser = {
        name: 'user1',
        email: 'user1@gmail.com',
        password: '12345678'
      };

      const response = await api
        .post('/api/v1/auth/test-register')
        .send(testUser);

      const cookies = response.headers['set-cookie'];
      const accessTokenCookie = cookies.find(cookie => cookie.startsWith('accessToken='));
      // Extract token from cookie string
      const token = helper.extractTokenFromCookie(accessTokenCookie);
      
      assert.equal(response.status, 201);
      assert.equal(response.body.user.name, testUser.name);
      assert.equal(response.body.user.role, 'user');
      assert.ok(!response.body.user.password); 
      assert.ok(token, 'Access token cookie should be present');
    });

    test('should not register user with existing email', async () => {
      const testUser = {
        name: 'user1',
        email: 'admin@mail.com', // Existing email
        password: '12345678'
      };

      const response = await api
        .post('/api/v1/auth/test-register')
        .send(testUser);

      assert.equal(response.status, 400);
      assert.match(response.body.msg, /Duplicate value/i);
    });

    test('should not register user with invalid email', async () => {
      const testUser = {
        name: 'user1',
        email: 'invalid-email',
        password: '12345678'
      };

      const response = await api
        .post('/api/v1/auth/test-register')
        .send(testUser);

      assert.equal(response.status, 400);
      assert.match(response.body.msg, /please provide a valid email/i);
    });

  });

  //  =====================================================================  //

  describe('GET /api/v1/auth/verify-email', async () => {

    beforeEach(() => {
      admin.isVerified = false;
    });

    test('should verify email successfully', async () => {

      const response = await api
        .get(`/api/v1/auth/verify-email?verificationToken=${admin.verificationToken}&email=${admin.email}`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .expect(200);
  
      const updatedAdmin = await User.findOne({ email: admin.email });
  
      assert.equal(updatedAdmin.isVerified, true);
      assert.match(response.body.msg, /Email verified!/);
    });
  
    test('should fail with invalid verification token', async () => {
      const response = await api
        .get(`/api/v1/auth/verify-email?verificationToken=invalidtoken&email=${admin.email}`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .expect(401);
  
      assert.match(response.body.msg, /Verification faild!/);
    });
  
    test('should fail with non-existent email', async () => {
      const response = await api
        .get(`/api/v1/auth/verify-email?verificationToken=${admin.verificationToken}&email=nonexistent@example.com`)
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .expect(401);
  
      assert.match(response.body.msg, /Verification faild!/);
    });
  });

  //  =====================================================================  //

  describe('POST /api/v1/auth/login', async () => {

    test('should login successfully with correct credentials', async () => {
      const response = await api
        .post('/api/v1/auth/login')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: helper.initialAdmin.email,
          password: helper.initialAdmin.password
        });

      assert.equal(response.status, 200);
      assert.ok(response.body.user, 'Response should have user object');
      assert.equal(response.body.user.name, helper.initialAdmin.name);
      assert.equal(response.body.user.role, 'admin');
      assert.ok(response.body.user.userID, 'User object should have userID');
      assert.ok(response.headers['set-cookie']); // Should set authentication cookie
    });

    test('should not login with incorrect password', async () => {
      const response = await api
        .post('/api/v1/auth/login')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: helper.initialAdmin.email,
          password: 'wrongpassword'
        });

      assert.equal(response.status, 401);
      assert.match(response.body.msg, /Please provide a correct email and password!/i);
    });

    test('should not login with non-existent or invalid email', async () => {
      const response = await api
        .post('/api/v1/auth/login')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: 'nonexistent@example.com',
          password: helper.initialAdmin.password
        });

      assert.equal(response.status, 401);
      assert.match(response.body.msg, /Please provide a correct email and password!/i);
    });

    test('should not login with missing email or password', async () => {
      const response = await api
        .post('/api/v1/auth/login')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({});

      assert.equal(response.status, 400);
      assert.match(response.body.msg, /Please provide email and password!/i);
    });

  });

  //  =====================================================================  //

  describe('DELETE /api/v1/auth/logout', async () => {
    test('should logout successfully', async () => {
      const response = await api
        .delete('/api/v1/auth/logout')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send()
        .expect(200);

      assert.match(response.body.msg, /User logged out/);
    });

    test('should not logout without valid token', async () => {
      const response = await api
        .delete('/api/v1/auth/logout')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send()
        .expect(401);

      assert.match(response.body.msg, /Authentication invalid/i);
    });
  });

  //  =====================================================================  //

   // In this case the test is for the /test-forgot-password endpoint, not the /forgot-password endpoint, but the logic is the same, except for send "reset password" email part, the reset password is tested in the /reset-password endpoint
  describe('POST /api/v1/auth/test-forgot-password', async () => {

    test('should send reset password email successfully whether user exists or not', async () => {
      const response = await api
        .post('/api/v1/auth/test-forgot-password')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: helper.initialAdmin.email
        });

      assert.equal(response.status, 200);
      assert.match(response.body.msg, /Please check your email to reset your password!/);
    });

    test('should not send reset password email with missing email', async () => {
      const response = await api
        .post('/api/v1/auth/test-forgot-password')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({});

      assert.equal(response.status, 400);
      assert.match(response.body.msg, /Please provide a valid email!/);
    });
  });

  //  =====================================================================  //

  describe('POST /api/v1/auth/reset-password', async () => {

    test('should reset password successfully', async () => {
      const passwordToken = await helper.resetPasswordToken(api);

      const response = await api
        .post('/api/v1/auth/reset-password')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: helper.initialAdmin.email,
          password: 'newpassword',
          token: passwordToken
        });

      assert.equal(response.status, 200);
      assert.match(response.body.msg, /Password successfully reset!/);
    });

    test('should not reset password with missing email or password', async () => {
      const passwordToken = await helper.resetPasswordToken(api);

      let response = await api
        .post('/api/v1/auth/reset-password')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          token: passwordToken
        });

      assert.equal(response.status, 400);
      assert.match(response.body.msg, /Please provide all values!/);
    });

    test('should not reset password with missing token', async () => {
      const response = await api
        .post('/api/v1/auth/reset-password')
        .set('User-Agent', 'test-agent')
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
          email: helper.initialAdmin.email,
          password: 'newpassword'
        });

      assert.equal(response.status, 403);
      assert.match(response.body.msg, /Unauthenticated!/);
    });
  });

  //  =====================================================================  //

});



import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' }); 
// tests/userRoutes.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../api/index.js'; // Adjust path as needed
import Users from '../api/models/users.js';
import Suggestions from '../api/models/suggestions.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Test user data
const testUser = {
  id_number: 'TEST123',
  name: {
    first_name: 'Test',
    last_name: 'User'
  },
  role: 'student',
  email: 'test@example.com',
  password: 'password123',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Test bio'
};

const adminUser = {
  id_number: 'ADMIN123',
  name: {
    first_name: 'Admin',
    last_name: 'User'
  },
  role: 'Admin',
  email: 'admin@example.com',
  password: 'admin123',
  avatar: 'https://example.com/admin.jpg',
  bio: 'Admin bio'
};
process.env.ACCESS_TOKEN_SECRET = "e5799e82dc2e0fb7cb359a38467dc901a75b1cecfb61ee4d48234cf341d317bf224ee65ecf512d97def6026a39f349b485dfb6f3550a15cb5d42dedf8e409667";
let testUserId;
let testUserToken;
let adminToken;

describe('User Routes', () => {
  beforeAll(async () => {
    // Connect to a test database

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error('JWT secret not loaded! Check .env.test');
    }
    await mongoose.connect("mongodb://localhost:27017/LabReservation-MCO3", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = "password123";
    const createdUser = await Users.create({
      ...testUser,
      password: hashedPassword
    });
    testUserId = createdUser._id;
    const hashedAdminPassword = "password123";
    await Users.create({
      ...adminUser,
      password: hashedAdminPassword
    });

    // Generate tokens
    testUserToken = jwt.sign(
      { id: testUserId.toString(), role: 'student' },
      "e5799e82dc2e0fb7cb359a38467dc901a75b1cecfb61ee4d48234cf341d317bf224ee65ecf512d97def6026a39f349b485dfb6f3550a15cb5d42dedf8e409667"
    );

    adminToken = jwt.sign(
      { id: 'adminId', role: 'Admin' },
      "e5799e82dc2e0fb7cb359a38467dc901a75b1cecfb61ee4d48234cf341d317bf224ee65ecf512d97def6026a39f349b485dfb6f3550a15cb5d42dedf8e409667"
    );
  });

  afterAll(async () => {
    // Clean up database
    await Users.deleteMany({});
    await Suggestions.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /users/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Wrong email or password');
    });
  });

  describe('POST /users/signup', () => {
    it('should create a new user', async () => {
      const newUser = {
        idNumberInput: 'NEW123',
        firstNameInput: 'New',
        lastNameInput: 'User',
        emailInput: 'new@example.com',
        passwordInput: 'newpassword123'
      };

      const response = await request(app)
        .post('/users/signup')
        .send(newUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');

      // Verify user was created
      const createdUser = await Users.findOne({ email: newUser.emailInput });
      expect(createdUser).toBeTruthy();
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/users/signup')
        .send({
          idNumberInput: 'DUPE123',
          firstNameInput: 'Duplicate',
          lastNameInput: 'Email',
          emailInput: testUser.email, // Existing email
          passwordInput: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already in use.');
    });
  });

  describe('GET /users/me', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUser.email);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /users/me', () => {
    it('should update user profile', async () => {
      const updates = {
        name: 'Updated Name',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.user.name.first_name).toBe('Updated');
      expect(response.body.user.name.last_name).toBe('Name');
      expect(response.body.user.bio).toBe('Updated bio');
    });

    it('should reject unauthorized updates', async () => {
      const response = await request(app)
        .put('/users/me')
        .send({ role: 'Admin' }); // Trying to escalate privileges

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /users/me', () => {
    it('should delete user account with correct password', async () => {
      const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ password: testUser.password });

      expect(response.status).toBe(204);

      // Verify user was deleted
      const deletedUser = await Users.findById(testUserId);
      expect(deletedUser).toBeNull();
    });

    it('should reject deletion with wrong password', async () => {
      const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ password: 'wrongpassword' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /users/suggestions', () => {
    it('should create a new suggestion', async () => {
      const suggestion = {
        email: 'suggestion@example.com',
        subject: 'Test suggestion',
        message: 'This is a test suggestion'
      };

      const response = await request(app)
        .post('/users/suggestions')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(suggestion);

      expect(response.status).toBe(201);

      // Verify suggestion was created
      const createdSuggestion = await Suggestions.findOne({ email: suggestion.email });
      expect(createdSuggestion).toBeTruthy();
    });
  });

});
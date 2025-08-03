// tests/labRoutes.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../api/index.js';
import Labs from '../api/models/labs.js';
import Users from '../api/models/users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Set test environment
process.env.ACCESS_TOKEN_SECRET = "e5799e82dc2e0fb7cb359a38467dc901a75b1cecfb61ee4d48234cf341d317bf224ee65ecf512d97def6026a39f349b485dfb6f3550a15cb5d42dedf8e409667";

// Test data
const testUser = {
  id_number: 'LABTEST123',
  name: { first_name: 'Lab', last_name: 'Tester' },
  email: 'labtest@example.com',
  password: 'labpassword123',
  role: 'student'
};

const testLab = {
  lab_name: 'Test Lab',
  lab_location: {
    building: 'Test Building',
    floor: '3',
    room: 301
  },
  lab_description: 'Test lab description',
  seats: [
    { col: 'A', row: 1, reservations: [] },
    { col: 'B', row: 2, reservations: [] }
  ],
  schedule: [
    { day: 'Monday', opening: '08:00', closing: '17:00' }
  ]
};

let testUserId;
let testUserToken;
let testLabId;

describe('Lab Routes', () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/LabReservation-MCO3-test", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test user
    await Users.deleteMany({});
    const hashedPassword = testUser.password;
    const user = await Users.create({ ...testUser, password: hashedPassword });
    testUserId = user._id;

    // Generate token
    testUserToken = jwt.sign(
      { id: testUserId.toString(), role: testUser.role },
      process.env.ACCESS_TOKEN_SECRET
    );

    // Create test lab
    await Labs.deleteMany({});
    const lab = await Labs.create(testLab);
    testLabId = lab._id;
  });

  afterAll(async () => {
    await Users.deleteMany({});
    await Labs.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /labs', () => {
    it('should fetch all labs', async () => {
      const response = await request(app)
        .get('/labs')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('lab_name');
    });
  });

  describe('GET /labs/:id', () => {
    it('should fetch a single lab by ID', async () => {
      const response = await request(app)
        .get(`/labs/${testLabId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('lab_name', testLab.lab_name);
      expect(response.body._id).toBe(testLabId.toString());
    });

    it('should return 404 for non-existent lab', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/labs/${fakeId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /lab-seats/:labId', () => {
    it('should fetch seats for a lab', async () => {
      const response = await request(app)
        .get(`/lab-seats/${testLabId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('seats');
      expect(response.body.seats.length).toBe(testLab.seats.length);
      expect(response.body.seats[0]).toHaveProperty('value');
    });
  });

  describe('GET /available-seats/:labId', () => {
    it('should check available seats', async () => {
      const queryParams = new URLSearchParams({
        date: '2023-01-01',
        time_in: '10:00',
        time_out: '12:00'
      });

      const response = await request(app)
        .get(`/available-seats/${testLabId}?${queryParams}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('available_seats');
      expect(response.body.available_seats.length).toBe(testLab.seats.length);
    });
  });
});
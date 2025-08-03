// tests/reservationRoutes.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../api/index.js';
import Reservations from '../api/models/reservations.js';
import Labs from '../api/models/labs.js';
import Users from '../api/models/users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Set test environment
process.env.ACCESS_TOKEN_SECRET = "e5799e82dc2e0fb7cb359a38467dc901a75b1cecfb61ee4d48234cf341d317bf224ee65ecf512d97def6026a39f349b485dfb6f3550a15cb5d42dedf8e409667";

// Test data
const testUser = {
  id_number: '12345678',
  name: { first_name: 'Reservation', last_name: 'Tester' },
  email: 'reservationtest@dlsu.edu.ph',
  password: 'password123',
  role: 'student'
};

const testLab = {
  lab_name: 'Reservation Test Lab',
  lab_location: {
    building: 'Test Building',
    floor: '3',
    room: 301
  },
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
let testReservationId;

describe('Reservation Routes', () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/LabReservation-MCO3", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test user
    await Users.deleteMany({});
    const hashedPassword = testUser.password
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

    // Create test reservation
    await Reservations.deleteMany({});
    const reservation = await Reservations.create({
      user_id: testUserId,
      lab_id: testLabId,
      time_in: new Date('2023-01-01T10:00:00'),
      time_out: new Date('2023-01-01T12:00:00'),
      status: 'Confirmed'
    });
    testReservationId = reservation._id;

    // Add reservation to lab seat
    await Labs.findByIdAndUpdate(testLabId, {
      $push: { 'seats.0.reservations': reservation._id }
    });
  });

  afterAll(async () => {
    await Users.deleteMany({});
    await Labs.deleteMany({});
    await Reservations.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /reservations', () => {
    it('should fetch all reservations', async () => {
      const response = await request(app)
        .get('/reservations')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('_id');
    });
  });

  describe('GET /reservations/:labId', () => {
    it('should fetch reservations for a lab', async () => {
      const response = await request(app)
        .get(`/reservations/${testLabId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /reservations', () => {
    it('should create a new reservation', async () => {
      const reservationData = {
        date: '2025-10-02',
        time_start: '12:00',
        hours: 2,
        user_id: testUserId,
        lab_id: testLabId,
        seats: ['A1']
      };

      const response = await request(app)
        .post('/reservations')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(reservationData);

      expect(response.status).toBe(500);
    });

    it('should reject invalid reservation data', async () => {
      const response = await request(app)
        .post('/reservations')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({}); // Missing required fields

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /reservations/:reservationId', () => {
    it('should update a reservation', async () => {
      const updateData = {
        time_in: '2023-01-01T11:00:00',
        time_out: '2023-01-01T13:00:00',
        column: 'A',
        row: 1
      };

      const response = await request(app)
        .put(`/reservations/${testReservationId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateData);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /reservations/:reservationId', () => {
    it('should delete a reservation', async () => {
      const response = await request(app)
        .delete(`/reservations/${testReservationId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /reservations/upcoming/:labId', () => {
    it('should fetch upcoming reservations', async () => {
      // Create a reservation that should be upcoming
      const now = new Date();
      const soon = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
      
      await Reservations.create({
        user_id: testUserId,
        lab_id: testLabId,
        time_in: soon,
        time_out: new Date(soon.getTime() + 3600000), // 1 hour later
        status: 'Confirmed'
      });

      const response = await request(app)
        .get(`/reservations/upcoming/${testLabId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('upcoming_reservations');
    });
  });
});
// tests/adminRoutes.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../api/index.js';
import Reservations from '../api/models/reservations.js';
import Labs from '../api/models/labs.js';
import Users from '../api/models/users.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Set test environment
process.env.ACCESS_TOKEN_SECRET = "e5799e82dc2e0fb7cb359a38467dc901a75b1cecfb61ee4d48234cf341d317bf224ee65ecf512d97def6026a39f349b485dfb6f3550a15cb5d42dedf8e409667";

// Test data
const adminUser = {
  id_number: 'ADMIN123',
  name: { first_name: 'Admin', last_name: 'User' },
  email: 'admin@example.com',
  password: 'adminpassword123',
  role: 'Admin'
};

const testStudent = {
  id_number: 'STUDENT123',
  name: { first_name: 'Test', last_name: 'Student' },
  email: 'student@example.com',
  password: 'studentpassword123',
  role: 'student'
};

const testLab = {
  lab_name: 'Admin Test Lab',
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

let adminToken;
let testStudentId;
let testLabId;
let testReservationId;

describe('Admin Routes', () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/LabReservation-MCO3-test", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create admin user
    await Users.deleteMany({});
    const hashedAdminPassword = adminUser.password;
    const admin = await Users.create({ ...adminUser, password: hashedAdminPassword });

    // Create test student
    const hashedStudentPassword = testStudent.password;
    const student = await Users.create({ ...testStudent, password: hashedStudentPassword });
    testStudentId = student._id;

    // Generate admin token
    adminToken = jwt.sign(
      { id: admin._id.toString(), role: adminUser.role },
      process.env.ACCESS_TOKEN_SECRET
    );

    // Create test lab
    await Labs.deleteMany({});
    const lab = await Labs.create(testLab);
    testLabId = lab._id;

    // Create test reservation
    await Reservations.deleteMany({});
    const reservation = await Reservations.create({
      user_id: testStudentId,
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

  describe('GET /admin/students', () => {
    it('should fetch all students', async () => {
      const response = await request(app)
        .get('/admin/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('id_number', testStudent.id_number);
      expect(response.body[0]).toHaveProperty('full_name', `${testStudent.name.first_name} ${testStudent.name.last_name}`);
    });

    it('should reject unauthorized access', async () => {
      const response = await request(app)
        .get('/admin/students');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /reservations', () => {
    it('should fetch all reservations with detailed information', async () => {
      const response = await request(app)
        .get('/reservations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /admin/reservations', () => {
    it('should create multiple reservations for a student', async () => {
      const reservationData = {
        date: '2023-01-02',
        time_start: '10:00',
        hours: 2,
        user_id: testStudent.id_number,
        lab_id: testLabId,
        isAnonymous: false,
        seats: ['A1', 'B2']
      };

      const response = await request(app)
        .post('/admin/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reservationData);

      expect(response.status).toBe(500);
    });

    it('should reject reservation with invalid student ID', async () => {
      const reservationData = {
        date: '2023-01-02',
        time_start: '10:00',
        hours: 2,
        user_id: 'INVALID123',
        lab_id: testLabId,
        seats: ['A1']
      };

      const response = await request(app)
        .post('/admin/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reservationData);

      expect(response.status).toBe(500);
    });

    it('should reject reservation outside lab hours', async () => {
      const reservationData = {
        date: '2023-01-02', // Monday
        time_start: '07:00', // Before opening
        hours: 2,
        user_id: testStudent.id_number,
        lab_id: testLabId,
        seats: ['A1']
      };

      const response = await request(app)
        .post('/admin/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reservationData);

      expect(response.status).toBe(500);
    });

    it('should reject reservation for already reserved seat', async () => {
      // First create a reservation
      await request(app)
        .post('/admin/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          date: '2023-01-02',
          time_start: '10:00',
          hours: 2,
          user_id: testStudent.id_number,
          lab_id: testLabId,
          seats: ['A1']
        });

      // Try to reserve same seat at overlapping time
      const response = await request(app)
        .post('/admin/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          date: '2023-01-02',
          time_start: '11:00', // Overlaps with existing reservation
          hours: 1,
          user_id: testStudent.id_number,
          lab_id: testLabId,
          seats: ['A1']
        });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /reservationId', () => {

    it('should return 404 for non-existent reservation', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/reservationId`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reservationId: fakeId });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid reservation ID format', async () => {
      const response = await request(app)
        .delete(`/reservationId`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reservationId: 'invalid-id' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid reservation ID format');
    });
  });
});
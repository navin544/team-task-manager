jest.mock('../../services/authService', () => ({
  registerUser: jest.fn().mockResolvedValue({
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'MEMBER'
    },
    accessToken: 'access-token',
    refreshToken: 'refresh-token'
  }),
  loginUser: jest.fn().mockRejectedValue({
    statusCode: 401,
    message: 'Invalid email or password'
  }),
  logoutUser: jest.fn(),
  refreshSession: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn()
}));

const request = require('supertest');

const app = require('../../app');

describe('public api routes', () => {
  test('GET /health returns health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /api/auth/register validates and returns session payload', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Strong@123'
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  test('POST /api/auth/login surfaces authentication failure responses', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'Wrong@123'
    });

    expect(response.status).toBe(401);
  });
});

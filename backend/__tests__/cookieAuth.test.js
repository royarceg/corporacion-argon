// =====================================================
// TEST: autenticación por cookie httpOnly
// - verifyToken debe aceptar el token desde la cookie (no solo el header)
// - login debe setear la cookie httpOnly y NO devolver el token en el body
// =====================================================

process.env.JWT_SECRET = 'test_secret_fase3';

const jwt = require('jsonwebtoken');

// --- verifyToken ---
const { verifyToken } = require('../src/middleware/authMiddleware');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    cookieCalls: [],
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    cookie(name, value, opts) { this.cookieCalls.push({ name, value, opts }); return this; },
    clearCookie() { return this; },
  };
}

describe('verifyToken (cookie httpOnly)', () => {
  test('acepta el token desde la cookie', () => {
    const token = jwt.sign({ id: 1, role: 'client_user' }, process.env.JWT_SECRET);
    const req = { headers: {}, cookies: { token } };
    const res = mockRes();
    let nextCalled = false;
    verifyToken(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(req.user.id).toBe(1);
  });

  test('sigue aceptando el header Authorization (compatibilidad con API)', () => {
    const token = jwt.sign({ id: 2, role: 'master_admin' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = mockRes();
    let nextCalled = false;
    verifyToken(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(req.user.id).toBe(2);
  });

  test('sin token (ni cookie ni header) → 401', () => {
    const req = { headers: {}, cookies: {} };
    const res = mockRes();
    verifyToken(req, res, () => {});
    expect(res.statusCode).toBe(401);
  });
});

// --- login ---
jest.mock('../src/config/database', () => ({ query: jest.fn() }));
jest.mock('../src/services/emailService', () => ({}));
jest.mock('bcryptjs');

const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { login } = require('../src/controllers/authController');

describe('login (cookie httpOnly)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('setea cookie httpOnly "token" y NO devuelve el token en el body', async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, user_name: 'u', name: 'U', email: 'e@e.com', role: 'client_user', client_id: 5, active: true, password: 'hash' }],
    });
    bcrypt.compare.mockResolvedValue(true);

    const req = { body: { username: 'u', password: 'p' } };
    const res = mockRes();

    await login(req, res);

    // Setea una cookie 'token' httpOnly
    const tokenCookie = res.cookieCalls.find((c) => c.name === 'token');
    expect(tokenCookie).toBeTruthy();
    expect(tokenCookie.opts.httpOnly).toBe(true);

    // El token NUNCA va en el body (solo en la cookie httpOnly)
    expect(res.body).not.toHaveProperty('token');
    expect(res.body.user).toBeTruthy();
  });
});

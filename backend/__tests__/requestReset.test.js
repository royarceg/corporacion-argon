// =====================================================
// TEST: requestReset NUNCA debe devolver el token en la respuesta
// (el bug crítico: hoy lo devuelve → toma de cuenta de admin)
// =====================================================

// Mocks "de fábrica": NO ejecutan el módulo real (sin conexión a PG ni a SMTP)
jest.mock('../src/config/database', () => ({ query: jest.fn() }));
jest.mock('../src/services/emailService', () => ({ sendPasswordReset: jest.fn() }));

const pool = require('../src/config/database');
const emailService = require('../src/services/emailService');
const { requestReset } = require('../src/controllers/authController');

// Mini mock de Response de Express
function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

describe('requestReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    emailService.sendPasswordReset = jest.fn().mockResolvedValue({ success: true });
  });

  test('para un usuario válido, NO devuelve el token y manda el email', async () => {
    // 1) SELECT del usuario (existe, activo, con email)
    // 2) UPDATE del reset_token
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, user_name: 'admin', email: 'admin@corporacionargon.com', active: true }] })
      .mockResolvedValueOnce({ rows: [] });

    const req = { body: { username: 'admin' } };
    const res = mockRes();

    await requestReset(req, res);

    // Lo crítico: el token JAMÁS sale en la respuesta
    expect(res.body).not.toHaveProperty('token');
    expect(res.body.success).toBe(true);
    // Y el enlace se manda por email al correo del usuario
    expect(emailService.sendPasswordReset).toHaveBeenCalledTimes(1);
    expect(emailService.sendPasswordReset.mock.calls[0][0]).toBe('admin@corporacionargon.com');
  });

  test('para un usuario inexistente, responde genérico sin filtrar nada ni mandar email', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = { body: { username: 'no_existe' } };
    const res = mockRes();

    await requestReset(req, res);

    expect(res.body).not.toHaveProperty('token');
    expect(res.body.success).toBe(true);
    expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
  });
});

// =====================================================
// TEST: createOrder debe bloquear la fila del cliente (FOR UPDATE)
// al generar el número de orden, para que dos órdenes simultáneas
// del mismo cliente no obtengan el mismo número (race condition).
// =====================================================

jest.mock('../src/config/database', () => ({ connect: jest.fn(), query: jest.fn() }));
jest.mock('../src/services/emailService', () => ({
  sendOrderAcknowledgement: jest.fn().mockResolvedValue({ success: true }),
  sendOrderConfirmation: jest.fn(),
}));

const pool = require('../src/config/database');
const { createOrder } = require('../src/controllers/orderController');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

function makeClient() {
  const query = jest.fn((sql) => {
    const s = String(sql);
    if (s === 'BEGIN' || s === 'COMMIT' || s === 'ROLLBACK') return Promise.resolve({});
    if (s.includes('order_prefix FROM clients')) return Promise.resolve({ rows: [{ order_prefix: 'ORD' }] });
    if (s.includes('COUNT(*)')) return Promise.resolve({ rows: [{ total: '3' }] });
    if (s.includes('INSERT INTO purchase_orders')) return Promise.resolve({ rows: [{ id: 100, client_id: 50 }] });
    if (s.includes('FROM client_product_prices')) return Promise.resolve({ rows: [{ price: '10.00' }] });
    if (s.includes('INSERT INTO order_items')) return Promise.resolve({});
    if (s.includes('UPDATE purchase_orders')) return Promise.resolve({});
    return Promise.resolve({ rows: [] });
  });
  return { query, release: jest.fn() };
}

describe('createOrder — numeración segura', () => {
  beforeEach(() => jest.clearAllMocks());

  test('bloquea la fila del cliente con FOR UPDATE al generar el número', async () => {
    const client = makeClient();
    pool.connect.mockResolvedValue(client);

    const req = {
      user: { client_id: 50, id: 8 },
      body: { customer_po: 'PO-1', wanted_date: '2026-07-01', items: [{ product_id: 1, quantity: 2 }] },
    };
    const res = mockRes();

    await createOrder(req, res);

    // La orden se crea bien...
    expect(res.statusCode).toBe(201);
    // ...y la lectura del cliente usa FOR UPDATE (lock que serializa la numeración)
    const lockCall = client.query.mock.calls.find((c) => /clients[\s\S]*FOR UPDATE/i.test(String(c[0])));
    expect(lockCall).toBeTruthy();
  });
});

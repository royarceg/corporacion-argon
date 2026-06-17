// =====================================================
// TEST: confirmOrder no debe escribir precios usando un item_id
// que no pertenece a la orden (integridad de precios del cliente)
// =====================================================

jest.mock('../src/config/database', () => ({ connect: jest.fn(), query: jest.fn() }));
jest.mock('../src/services/emailService', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendOrderAcknowledgement: jest.fn(),
}));

const pool = require('../src/config/database');
const { confirmOrder } = require('../src/controllers/orderController');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

// Cliente de DB simulado. La orden 1 (cliente 50) tiene SOLO el item 10 (producto 100).
function makeClient() {
  const query = jest.fn((sql) => {
    const s = String(sql);
    if (s === 'BEGIN' || s === 'ROLLBACK' || s === 'COMMIT') return Promise.resolve({});
    if (s.includes('FROM purchase_orders WHERE id')) {
      return Promise.resolve({ rows: [{ id: 1, client_id: 50, status: 'pending' }] });
    }
    if (s.includes('product_id FROM order_items WHERE purchase_order_id')) {
      return Promise.resolve({ rows: [{ id: 10, product_id: 100 }] });
    }
    if (s.includes('UPDATE order_items')) return Promise.resolve({ rowCount: 1 });
    if (s.includes('client_product_prices')) return Promise.resolve({});
    if (s.includes('UPDATE purchase_orders')) return Promise.resolve({});
    return Promise.resolve({ rows: [] });
  });
  return { query, release: jest.fn() };
}

describe('confirmOrder', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rechaza un item que NO pertenece a la orden y no escribe ningún precio', async () => {
    const client = makeClient();
    pool.connect.mockResolvedValue(client);

    const req = { params: { id: '1' }, body: { items: [{ id: 999, quantity_confirmed: 2, unit_price_confirmed: 5 }] } };
    const res = mockRes();

    await confirmOrder(req, res);

    expect(res.statusCode).toBe(400);
    const wrotePrice = client.query.mock.calls.some((c) => String(c[0]).includes('client_product_prices'));
    expect(wrotePrice).toBe(false);
  });

  test('confirma un item válido y escribe el precio del producto correcto de la orden', async () => {
    const client = makeClient();
    pool.connect.mockResolvedValue(client);

    const req = { params: { id: '1' }, body: { items: [{ id: 10, quantity_confirmed: 3, unit_price_confirmed: 7 }] } };
    const res = mockRes();

    await confirmOrder(req, res);

    expect(res.statusCode).toBe(200);
    // El precio se escribe con el product_id (100) derivado de la orden, no de un subquery con el item_id
    const priceCall = client.query.mock.calls.find((c) => String(c[0]).includes('client_product_prices'));
    expect(priceCall).toBeTruthy();
    expect(priceCall[1]).toContain(100);
  });
});

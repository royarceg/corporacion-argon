// =====================================================
// TEST: getCart debe traer las imágenes en UNA sola query (no N+1).
// Antes hacía 1 query de imagen por ítem del carrito.
// =====================================================

jest.mock('../src/config/database', () => ({ query: jest.fn(), connect: jest.fn() }));

const pool = require('../src/config/database');
const { getCart } = require('../src/controllers/cartController');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

describe('getCart — sin N+1', () => {
  beforeEach(() => jest.clearAllMocks());

  test('trae todas las imágenes en una sola query, no una por ítem', async () => {
    pool.query.mockImplementation((sql) => {
      const s = String(sql);
      if (s.includes('FROM cart_items')) {
        return Promise.resolve({ rows: [
          { cart_item_id: 1, product_id: 10, unit_price: '5', quantity: 2 },
          { cart_item_id: 2, product_id: 20, unit_price: '3', quantity: 1 },
          { cart_item_id: 3, product_id: 30, unit_price: '7', quantity: 4 },
        ] });
      }
      if (s.includes('product_images')) {
        return Promise.resolve({ rows: [
          { product_id: 10, image_url: 'a.jpg' },
          { product_id: 20, image_url: 'b.jpg' },
        ] });
      }
      return Promise.resolve({ rows: [] });
    });

    const req = { user: { id: 8, client_id: 50 } };
    const res = mockRes();

    await getCart(req, res);

    // Una sola query a product_images (no 3)
    const imageQueries = pool.query.mock.calls.filter((c) => String(c[0]).includes('product_images'));
    expect(imageQueries.length).toBe(1);

    // El carrito sale bien y cada ítem recibe su imagen correcta
    expect(res.body.cart.items.length).toBe(3);
    const byId = Object.fromEntries(res.body.cart.items.map((i) => [i.product_id, i.image_url]));
    expect(byId[10]).toBe('a.jpg');
    expect(byId[20]).toBe('b.jpg');
    expect(byId[30]).toBeNull();
  });
});

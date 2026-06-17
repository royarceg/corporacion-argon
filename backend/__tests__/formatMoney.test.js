// =====================================================
// TEST: formatMoney — pg devuelve DECIMAL como string,
// así que .toFixed() directo revienta. El helper debe normalizar.
// =====================================================

const formatMoney = require('../src/utils/formatMoney');

describe('formatMoney', () => {
  test('formatea strings numéricos (como los devuelve pg) a 2 decimales', () => {
    expect(formatMoney('12.5')).toBe('12.50');
    expect(formatMoney('1000')).toBe('1000.00');
  });

  test('formatea números a 2 decimales', () => {
    expect(formatMoney(7)).toBe('7.00');
    expect(formatMoney(3.456)).toBe('3.46');
  });

  test('null / undefined / no-numérico → 0.00 (no "NaN")', () => {
    expect(formatMoney(null)).toBe('0.00');
    expect(formatMoney(undefined)).toBe('0.00');
    expect(formatMoney('abc')).toBe('0.00');
  });
});

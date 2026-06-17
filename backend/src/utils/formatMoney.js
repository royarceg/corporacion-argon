// =====================================================
// formatMoney — normaliza un valor monetario a string con 2 decimales.
// node-postgres devuelve las columnas DECIMAL/NUMERIC como STRING,
// así que llamar .toFixed() directo revienta. Esto lo hace seguro.
// =====================================================
function formatMoney(value) {
  const n = Number(value);
  return (Number.isFinite(n) ? n : 0).toFixed(2);
}

module.exports = formatMoney;

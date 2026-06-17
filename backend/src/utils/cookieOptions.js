// =====================================================
// Opciones de la cookie de sesión (JWT) httpOnly.
// En producción: Secure + SameSite=Lax. El frontend (corporacionargon.com)
// y el backend (api.corporacionargon.com) comparten dominio raíz, así que
// SameSite=Lax envía la cookie en las peticiones del frontend sin exponerla a JS.
// =====================================================
function authCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24h, igual que la expiración del JWT
  };
}

module.exports = authCookieOptions;

// Small wrapper around Express's cookie helpers, with shared defaults
// applied to every cookie this app sets (used for things like an auth token).
export const cookies = {
  // Default options applied to every cookie unless overridden by the caller.
  getoptions: () => ({
    httpOnly: true, // not readable via document.cookie in the browser (mitigates XSS token theft)
    secure: process.env.NODE_ENV === 'production', // only sent over HTTPS in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours, in milliseconds
  }),

  // Set a cookie on the response, merging any custom options over the defaults.
  set: (res, name, value, options = {}) => {
    res.cookie(name, value, { ...cookies.getoptions(), ...options });
  },

  // Clear a cookie on the response (must be called with matching options to actually remove it).
  clear: (res, name, options = {}) => {
    res.clearCookie(name, { ...cookies.getoptions(), ...options });
  },

  // Read a cookie's value off the incoming request (requires cookieParser() to be wired in app.js).
  get: (req, name) => {
    return req.cookies[name];
  },
};

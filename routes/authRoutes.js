const passport = require('passport');

module.exports = app => {
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/blogs');
    }
  );

  // Passport will respond with a 401 Unauthorized status,
  // and any additional route handlers will not be invoked. 
  // If authentication succeeds, the next handler will be invoked
  // and the req.user property will be set to the authenticated user.

  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};

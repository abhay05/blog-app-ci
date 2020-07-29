const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

// VISUAL FLOW
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });              │
//                │ 
//                │
//                └─────────────────┬──→ saved to session
//                                  │    req.session.passport.user = {id: '..'}
//                                  │
//                                  ↓           
// passport.deserializeUser(function(id, done) {
//                  ┌───────────────┘
//                  │
//                  ↓ 
//   User.findById(id, function(err, user) {
//       done(err, user);
//   });            └──────────────→ user object attaches to the request as req.user   
// });

passport.use(
  new GoogleStrategy(
    {
      callbackURL: '/auth/google/callback',
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        const user = await new User({
          googleId: profile.id,
          displayName: profile.displayName
        }).save();
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

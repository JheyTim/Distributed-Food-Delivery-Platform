const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      let user = await User.findOne({ googleId: id });

      if (!user) {
        user = new User({
          name: displayName,
          email: emails[0].value,
          googleId: id,
        });
        await user.save();
      }

      return done(null, user);
    }
  )
);

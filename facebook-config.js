import { Strategy as FacebookStrategy } from 'passport-facebook';

export default function initializeFacebook(passport, getUserByEmail, getUserById, facebookFindOrCreateUser) {
  passport.use(new FacebookStrategy({
    clientID:process.env.FACEBOOK_CLIENT_ID,
    clientSecret:process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
    profileFields: ['id', 'displayName', 'photos', 'email']

  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await facebookFindOrCreateUser(profile);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(id);
      done(null, user[0]);
    } catch (err) {
      done(err);
    }
  });
}

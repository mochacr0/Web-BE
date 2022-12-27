import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/user.model.js';
import generateAuthToken from '../utils/generateToken.js';

const googleVerify = async (
  request,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  //Note: handle user login
  //Need to do: change current saved user data if necessary
  try {
    let accessToken;
    const existingUser = await User.findOne({
      email: profile.emails[0].value,
    });
    if (existingUser) {
      accessToken = generateAuthToken({ _id: existingUser._id });
      return done(null, { ...existingUser, accessToken });
    }
    const savedUser = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
    });
    accessToken = generateAuthToken({ _id: savedUser._id });
    return done(null, { ...savedUser, accessToken });
  } catch (error) {
    return done(error, false);
  }
};

const facebookVerify = async (
  request,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  //Note: handle user login
  //Need to do: change current saved user data if necessary
  try {
    let accessToken;
    const existingUser = await User.findOne({
      facebookId: profile.id,
    });
    if (existingUser) {
      accessToken = generateAuthToken({ _id: existingUser._id });
      return done(null, { ...existingUser, accessToken });
    }
    const savedUser = await User.create({
      name: profile.displayName,
      facebookId: profile.id,
    });
    accessToken = generateAuthToken({ _id: savedUser._id });
    return done(null, { ...savedUser, accessToken });
  } catch (error) {
    return done(error, false);
  }
};

const passportGoogleConfig = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/google/callback',
        passReqToCallback: true,
      },
      googleVerify
    )
  );
};

const passportFacebookConfig = (passport) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APPLICATION_ID,
        clientSecret: process.env.FACEBOOK_APPLICATION_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/facebook/callback',
        passReqToCallback: true,
      },
      facebookVerify
    )
  );
};

export { passportGoogleConfig, passportFacebookConfig };

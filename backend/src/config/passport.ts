import bcrpyt from 'bcrypt';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from '../models/user';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Profile, Strategy as GitHubStrategy } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import env from '../env';

// passport stores user id in session
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

// password fetched user session
passport.deserializeUser((id: string, cb) => {
  cb(null, { _id: new mongoose.Types.ObjectId(id) });
});

// executed when user signs in
passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const existingUser = await UserModel.findOne({ username })
        .select('+email +password')
        .exec();

      if (!existingUser || !existingUser.password) {
        return cb(null, false);
      }

      const passwordMatch = await bcrpyt.compare(
        password,
        existingUser.password
      );

      if (!passwordMatch) {
        return cb(null, false);
      }

      const user = existingUser.toObject();
      delete user.password;

      cb(null, user);
    } catch (error) {
      cb(error);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.SERVER_URL}/users/oauth2/redirect/google`,
      scope: ['profile'],
    },
    async (accessToken, refreshToken, userProfile, cb) => {
      try {
        let user = await UserModel.findOne({ googleId: userProfile.id }).exec();

        if (!user) {
          user = await UserModel.create({
            googleId: userProfile.id,
          });
        }
        cb(null, user);
      } catch (error) {
        if (error instanceof Error) {
          cb(error);
        }
        throw error;
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: `${env.SERVER_URL}/users/oauth2/redirect/github`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: VerifyCallback
    ) => {
      try {
        let user = await UserModel.findOne({ githubId: profile.id }).exec();

        if (!user) {
          user = await UserModel.create({
            githubId: profile.id,
          });
        }
        cb(null, user);
      } catch (error) {
        if (error instanceof Error) {
          cb(error);
        }
        throw error;
      }
    }
  )
);

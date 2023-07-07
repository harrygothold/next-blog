import bcrpyt from 'bcrypt';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from '../models/user';

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

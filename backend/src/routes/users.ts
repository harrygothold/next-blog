import express from 'express';
import passport from 'passport';
import * as UsersController from '../controllers/users';
import env from '../env';
import { profilePicUpload } from '../middleware/image-upload';
import {
  loginRateLimit,
  requestVerificationCodeRateLimit,
} from '../middleware/rate-limit';
import requiresAuth from '../middleware/requiresAuth';
import setSessionReturnTo from '../middleware/setSessionReturnTo';
import validateRequestSchema from '../middleware/validateRequestSchema';
import {
  requestVerificationCodeSchema,
  resetPasswordSchema,
  signUpSchema,
  updateUserSchema,
} from '../validation/users';

const router = express.Router();

router.post(
  '/signup',
  validateRequestSchema(signUpSchema),
  UsersController.signUp
);

router.post(
  '/verification-code',
  requestVerificationCodeRateLimit,
  validateRequestSchema(requestVerificationCodeSchema),
  UsersController.requestEmailVerficationCode
);

router.post(
  '/reset-password-code',
  requestVerificationCodeRateLimit,
  validateRequestSchema(requestVerificationCodeSchema),
  UsersController.requestResetPasswordCode
);

router.post(
  '/reset-password',
  validateRequestSchema(resetPasswordSchema),
  UsersController.resetPassword
);

router.post(
  '/login',
  loginRateLimit,
  passport.authenticate('local'),
  (req, res) => res.status(200).json(req.user)
);

router.get('/me', requiresAuth, UsersController.getAuthenticatedUser);

router.get('/profile/:username', UsersController.getUserByUsername);

router.post('/logout', UsersController.logOut);

router.get(
  '/login/google',
  setSessionReturnTo,
  passport.authenticate('google')
);

router.get(
  '/login/github',
  setSessionReturnTo,
  passport.authenticate('github')
);

router.get(
  '/oauth2/redirect/google',
  passport.authenticate('google', {
    successReturnToOrRedirect: env.WEBSITE_URL,
    keepSessionInfo: true,
  })
);

router.get(
  '/oauth2/redirect/github',
  passport.authenticate('github', {
    successReturnToOrRedirect: env.WEBSITE_URL,
    keepSessionInfo: true,
  })
);

router.patch(
  '/me',
  requiresAuth,
  profilePicUpload.single('profilePic'),
  validateRequestSchema(updateUserSchema),
  UsersController.updateUser
);

export default router;

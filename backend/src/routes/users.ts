import express from 'express';
import passport from 'passport';
import * as UsersController from '../controllers/users';
import requiresAuth from '../middleware/requiresAuth';
import validateRequestSchema from '../middleware/validateRequestSchema';
import { signUpSchema } from '../validation/users';

const router = express.Router();

router.post(
  '/signup',
  validateRequestSchema(signUpSchema),
  UsersController.signUp
);

router.post('/login', passport.authenticate('local'), (req, res) =>
  res.status(200).json(req.user)
);

router.get('/me', requiresAuth, UsersController.getAuthenticatedUser);

router.post('/logout', UsersController.logOut);

export default router;

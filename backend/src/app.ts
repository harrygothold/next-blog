import 'dotenv/config';
import express from 'express';
import blogPostsRoutes from './routes/blog-posts';
import usersRoutes from './routes/users';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from './middleware/errorHandler';
import createHttpError from 'http-errors';
import session from 'express-session';
import sessionConfig from './config/session';
import passport from 'passport';
import './config/passport';
import corsOptions from './config/cors';

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use(cors(corsOptions));

app.use(session(sessionConfig));

app.use(passport.authenticate('session'));

app.use('/uploads/featured-images', express.static('uploads/featured-images'));

app.use('/posts', blogPostsRoutes);
app.use('/users', usersRoutes);

app.use((req, res, next) => next(createHttpError(404, 'Endpoint not found')));

app.use(errorHandler);

export default app;

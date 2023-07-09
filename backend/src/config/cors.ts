import { CorsOptions } from 'cors';
import env from '../env';

const corsOptions: CorsOptions = {
  origin: env.WEBSITE_URL,
  credentials: true,
};

export default corsOptions;

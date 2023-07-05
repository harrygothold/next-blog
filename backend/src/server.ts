import mongoose from 'mongoose';
import app from './app';
import env from './env';

const port = env.PORT;

mongoose
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log('Database Connection Successful');
    app.listen(port, () => console.log(`Server started on port ${port} 🚀`));
  })
  .catch(console.error);

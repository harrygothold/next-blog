import mongoose from 'mongoose';

export const destroyAllActiveSessionsForUser = async (userId: string) => {
  const regexp = new RegExp(`^${userId}`);

  mongoose.connection.db.collection('sessions').deleteMany({ _id: regexp });
};

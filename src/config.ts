import { registerAs } from '@nestjs/config';

export default registerAs('configuration', () => {
  return {
    database: {
      username: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
      db: process.env.MONGO_DB,
      cluster: process.env.MONGO_CLUSTER,
    }
  };
});

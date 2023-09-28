import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import configuration from '../config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigType<typeof configuration>) => {
        const { db, password, username, cluster } = config.database;
        return {
          uri: `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/test`,
          user: username,
          pass: password,
          dbName: db,
        };
      },
      inject: [configuration.KEY],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

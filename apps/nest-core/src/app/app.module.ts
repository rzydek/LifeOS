import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { SearchModule } from '../search/search.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PersonasModule } from '../personas/personas.module';

@Module({
    imports: [
      ScheduleModule.forRoot(),
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      PersonasModule,
      PrismaModule,
      UsersModule,
      AuthModule,
      SearchModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}



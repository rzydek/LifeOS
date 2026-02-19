import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService, SchedulerService],
  exports: [SearchService],
})
export class SearchModule {}

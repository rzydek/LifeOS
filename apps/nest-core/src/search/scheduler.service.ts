import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
    });
  }

  async onModuleInit() {
    this.logger.log('Scheduler Service initialized. Running immediate check for due searches...');
    await this.handleCron(); 
  }

  @Cron('0 */4 * * *')
  async handleCron() {
    this.logger.debug('Checking for due searches...');

    const now = new Date();
    
    const activeSearches = await this.prisma.searchConfig.findMany({
      where: { isActive: true },
    });

    let scheduledCount = 0;

    for (const config of activeSearches) {
      const lastRun = config.lastRunAt ? new Date(config.lastRunAt).getTime() : 0;
      const intervalMs = (config.checkInterval || 3600) * 1000;
      const nextRun = lastRun + intervalMs;
      
      if (now.getTime() >= nextRun) {
        await this.scheduleSearch(config);
        scheduledCount++;
      }
    }

    if (scheduledCount > 0) {
      this.logger.log(`Scheduled ${scheduledCount} searches.`);
    }
  }

  async triggerSearchImmediately(searchConfigId: string) {
    const config = await this.prisma.searchConfig.findUnique({
      where: { id: searchConfigId },
    });

    if (config && config.isActive) {
      this.logger.log(`Manually triggering search: ${config.query} (${config.id})`);
      await this.scheduleSearch(config);
    } else {
        this.logger.warn(`Search config ${searchConfigId} not found or inactive.`);
    }
  }

  private async scheduleSearch(config: any) {
    const payload: any = {
      type: 'scrape',
      configId: config.id,
      query: config.query,
      source: config.source || 'olx',
      parameters: config.parameters || {},
    };

    try {
      await this.redis.lpush('task_queue', JSON.stringify(payload));
      
      await this.prisma.searchConfig.update({
        where: { id: config.id },
        data: { lastRunAt: new Date() },
      });
      
      this.logger.log(`Queued search: ${config.query} (${config.id})`);
    } catch (error) {
      this.logger.error(`Failed to schedule search ${config.id}: ${error.message}`);
    }
  }
}

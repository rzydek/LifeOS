import { CreateCategoryDto, CreateLocationDto, CreateSearchConfigDto, OfferFilterDto, UpdateSearchConfigDto } from './dto/search.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulerService } from './scheduler.service';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private schedulerService: SchedulerService,
  ) {}

  async createSearchConfig(userId: number, data: CreateSearchConfigDto) {
    const config = await this.prisma.searchConfig.create({
      data: {
        ...data,
        userId,
        isActive: true,
      },
    });

    // Trigger search immediately
    await this.schedulerService.triggerSearchImmediately(config.id);
    
    return config;
  }

  async getSearchConfigs(userId: number) {
    return this.prisma.searchConfig.findMany({
      where: { userId },
      include: {
        category: true,
        location: true,
      },
    });
  }

  async updateSearchConfig(id: string, data: UpdateSearchConfigDto) {
    const config = await this.prisma.searchConfig.update({
      where: { id },
      data,
    });
    
    // Trigger if now active or query changed - simple logic: always trigger on update if active
    if (config.isActive) {
        // Run in background so update isn't blocked too long? Or await?
        // Let's await to confirm it's queued.
        await this.schedulerService.triggerSearchImmediately(config.id);
    }
    
    return config;
  }

  async deleteSearchConfig(id: string) {
    return this.prisma.searchConfig.delete({
      where: { id },
    });
  }
  
  async addCategory(data: CreateCategoryDto) {
    return this.prisma.category.upsert({
      where: { id: data.id },
      update: { name: data.name, parentId: data.parentId },
      create: data,
    });
  }

  async getCategories() {
    return this.prisma.category.findMany();
  }

  async addLocation(data: CreateLocationDto) {
    return this.prisma.location.upsert({
      where: { id: data.id },
      update: { name: data.name, type: data.type },
      create: data,
    });
  }

  async getLocations() {
    return this.prisma.location.findMany();
  }

  async getOffers(filter: OfferFilterDto) {
    const { searchConfigId, onlyGreatDeals, minAiScore } = filter;
    
    return this.prisma.scrapedOffer.findMany({
      where: {
        searchConfigId: searchConfigId,
        isActive: true,
        ...(onlyGreatDeals ? { aiScore: { gte: minAiScore || 80 } } : {}),
      },
      orderBy: [
        { detectedAt: 'desc' },
        { aiScore: 'desc' },
      ],
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        }
      }
    });
  }
  
  async getOfferHistory(offerId: string) {
    return this.prisma.offerPriceHistory.findMany({
        where: { offerId },
        orderBy: { recordedAt: 'desc' },
    });
  }
}

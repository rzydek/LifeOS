import { Controller, Get, Post, Body, Param, Query, Delete, Put, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateCategoryDto, CreateLocationDto, CreateSearchConfigDto, OfferFilterDto, UpdateSearchConfigDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('config')
  async createConfig(
    @Body() config: CreateSearchConfigDto,
    // Extract userId from AuthGuard later (assuming 1 for now)
    // @Req() req
  ) {
    const userId = 1; // Temporary: hardcoded user
    return this.searchService.createSearchConfig(userId, config);
  }

  @Get('config')
  async getConfigs() {
    const userId = 1; 
    return this.searchService.getSearchConfigs(userId);
  }

  @Put('config/:id')
  async updateConfig(@Param('id') id: string, @Body() updateDto: UpdateSearchConfigDto) {
    return this.searchService.updateSearchConfig(id, updateDto);
  }

  @Delete('config/:id')
  async deleteConfig(@Param('id') id: string) {
    return this.searchService.deleteSearchConfig(id);
  }

  @Post('categories')
  async addCategory(@Body() category: CreateCategoryDto) {
    return this.searchService.addCategory(category);
  }
  
  @Get('categories')
  async getCategories() {
    return this.searchService.getCategories();
  }

  @Post('locations')
  async addLocation(@Body() location: CreateLocationDto) {
    return this.searchService.addLocation(location);
  }
  
  @Get('locations')
  async getLocations() {
    return this.searchService.getLocations();
  }

  @Get('offers')
  async getOffers(@Query() filter: OfferFilterDto) {
    return this.searchService.getOffers(filter);
  }

  @Get('offers/:id/history')
  async getOfferHistory(@Param('id') id: string) {
    return this.searchService.getOfferHistory(id);
  }
}

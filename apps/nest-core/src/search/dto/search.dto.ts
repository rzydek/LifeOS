import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSearchConfigDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === "" ? null : value)
  categoryId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === "" ? null : value)
  locationId?: string;

  @IsNumber()
  @IsOptional()
  radius?: number;

  @IsNumber()
  @IsOptional()
  checkInterval?: number;
  
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === "" ? null : value)
  parentId?: string;
}

export class OfferFilterDto {
  @IsString()
  @IsOptional()
  searchConfigId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  onlyGreatDeals?: boolean;

  @IsNumber()
  @IsOptional()
  minAiScore?: number;
}

export class UpdateSearchConfigDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === "" ? null : value)
  categoryId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === "" ? null : value)
  locationId?: string;

  @IsNumber()
  @IsOptional()
  radius?: number;

  @IsNumber()
  @IsOptional()
  checkInterval?: number;
  
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

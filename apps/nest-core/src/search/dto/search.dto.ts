import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSearchConfigDto {
  @IsString()
  @IsNotEmpty()
  query: string;
  
  @IsString()
  @IsOptional()
  source?: string;

  @IsObject()
  @IsOptional()
  parameters?: any; // Generic JSON payload

  @IsNumber()
  @IsOptional()
  checkInterval?: number;
  
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  userIntent?: string;

  @IsString()
  @IsOptional()
  personaId?: string;
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

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  minScore?: number;
}

export class UpdateSearchConfigDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsObject()
  @IsOptional()
  parameters?: any;

  @IsNumber()
  @IsOptional()
  checkInterval?: number;
  
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  userIntent?: string;

  @IsString()
  @IsOptional()
  personaId?: string;
}

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  instruction: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

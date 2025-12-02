import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Company email address',
    example: 'contact@techsolutions.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Company phone number',
    example: '0123456789',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Company password',
    minLength: 6,
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techsolutions.com',
  })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Company location',
    example: 'Ho Chi Minh City, Vietnam',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading technology solutions provider...',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
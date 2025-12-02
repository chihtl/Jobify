import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'Company ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
  })
  name: string;

  @ApiProperty({
    description: 'Company email address',
    example: 'contact@techsolutions.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png',
  })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techsolutions.com',
  })
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Company location',
    example: 'Ho Chi Minh City, Vietnam',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading technology solutions provider...',
  })
  description?: string;

  @ApiProperty({
    description: 'Company creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Company last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
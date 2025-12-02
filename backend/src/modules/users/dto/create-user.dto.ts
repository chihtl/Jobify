import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExperienceDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Corp',
  })
  @IsNotEmpty()
  @IsString()
  company: string;

  @ApiPropertyOptional({
    description: 'Work location',
    example: 'Ho Chi Minh City, Vietnam',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Start date (YYYY-MM format)',
    example: '2020-01',
  })
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM format)',
    example: '2023-12',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Currently working here',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @ApiPropertyOptional({
    description: 'Job description',
    example: 'Led a team of 5 developers...',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    minLength: 6,
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+84901234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'User resume URL',
    example: 'https://example.com/resume.pdf',
  })
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @ApiPropertyOptional({
    description: 'User location/address',
    example: 'Ho Chi Minh City, Vietnam',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'User bio/description',
    example: 'Experienced software developer with 5+ years in web development',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Array of skill IDs',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  skillIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of work experiences',
    type: [ExperienceDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences?: ExperienceDto[];

  @ApiPropertyOptional({
    description: 'Avatar file object (for file upload)',
    example: {},
  })
  @IsOptional()
  avatarFile?: any;
}

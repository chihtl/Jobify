import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ExperienceLevel, JobType } from '../../../common/enums';

export class CreateJobPostDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Senior Backend Developer',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Job description',
    example:
      'We are looking for a senior backend developer with expertise in Node.js...',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Company ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  companyId: string;

  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Array of skill IDs',
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  skillIds?: string[];

  @ApiPropertyOptional({
    description: 'Job location',
    example: 'Ho Chi Minh City, Vietnam',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Minimum salary',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum salary',
    example: 2000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({
    description: 'Job type',
    enum: JobType,
    example: JobType.FULL_TIME,
  })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional({
    description: 'Experience level required',
    enum: ExperienceLevel,
    example: ExperienceLevel.SENIOR,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({
    description: 'Whether the job post is active',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = false;

  @ApiPropertyOptional({
    description: 'Job status for approval workflow',
    example: 'pending',
    default: 'pending',
  })
  @IsOptional()
  @IsString()
  status?: string = 'pending';

  @ApiPropertyOptional({
    description: 'Job expiration date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Job requirements',
    example: [
      'Bachelor degree in Computer Science',
      'At least 3 years of experience',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({
    description: 'Job benefits',
    example: [
      'Health insurance',
      'Flexible working hours',
      '13th month salary',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
}

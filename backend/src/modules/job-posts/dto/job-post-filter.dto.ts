import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ExperienceLevel, JobType } from '../../../common/enums';

export class JobPostFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query for title and description',
    example: 'backend developer',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Company ID to filter by',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Category ID to filter by',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Array of skill IDs to filter by',
    example: ['507f1f77bcf86cd799439013'],
    type: [String],
  })
  @IsOptional()
  @IsString({each: true})
  skillIds?: string[];

  @ApiPropertyOptional({
    description: 'Location to filter by',
    example: 'Ho Chi Minh City',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Job type to filter by',
    enum: JobType,
    example: JobType.FULL_TIME,
  })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional({
    description: 'Experience level to filter by',
    enum: ExperienceLevel,
    example: ExperienceLevel.SENIOR,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({
    description: 'Minimum salary filter',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @ApiPropertyOptional({
    description: 'Maximum salary filter',
    example: 2000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['createdAt', 'title', 'salaryMin', 'salaryMax'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Job status filter',
    example: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  })
  @IsOptional()
  @IsString()
  status?: string;
}

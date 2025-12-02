import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApplicationStatus } from '../../../common/enums';

export class ApplicationFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'User ID to filter by',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Job post ID to filter by',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  jobPostId?: string;

  @ApiPropertyOptional({
    description: 'Company ID to filter by',
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Application status to filter by',
    enum: ApplicationStatus,
    example: ApplicationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['createdAt', 'updatedAt', 'status'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'status'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}

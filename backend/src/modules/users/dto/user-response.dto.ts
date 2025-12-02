import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExperienceResponseDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
  })
  title: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Corp',
  })
  company: string;

  @ApiPropertyOptional({
    description: 'Work location',
    example: 'Ho Chi Minh City, Vietnam',
  })
  location?: string;

  @ApiProperty({
    description: 'Start date (YYYY-MM format)',
    example: '2020-01',
  })
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM format)',
    example: '2023-12',
  })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Currently working here',
    example: false,
  })
  current?: boolean;

  @ApiPropertyOptional({
    description: 'Job description',
    example: 'Led a team of 5 developers...',
  })
  description?: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+84901234567',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'User resume URL',
    example: 'https://example.com/resume.pdf',
  })
  resumeUrl?: string;

  @ApiPropertyOptional({
    description: 'User location',
    example: 'Ho Chi Minh City, Vietnam',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Experienced software developer',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Array of skill IDs',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  skillIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of work experiences',
    type: [ExperienceResponseDto],
  })
  experiences?: ExperienceResponseDto[];

  @ApiProperty({
    description: 'User creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
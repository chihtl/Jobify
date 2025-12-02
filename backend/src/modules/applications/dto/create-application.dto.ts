import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'User ID who is applying',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    description: 'Job post ID being applied to',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  jobPostId: string;

  @ApiPropertyOptional({
    description: 'Cover letter or application message',
    example: 'I am very interested in this position and believe my skills...',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Resume URL (override user default resume)',
    example: 'https://example.com/resume-special.pdf',
  })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;
}
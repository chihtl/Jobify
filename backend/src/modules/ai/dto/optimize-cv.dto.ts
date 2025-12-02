import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OptimizeCvDto {
  @ApiProperty({
    description: 'User ID who owns the CV',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'URL path to the user resume file',
    example: '/users/123/resume/resume.pdf',
  })
  @IsNotEmpty()
  @IsString()
  resumeUrl: string;

  @ApiProperty({
    description: 'Job post ID to optimize CV for',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  jobId: string;
}

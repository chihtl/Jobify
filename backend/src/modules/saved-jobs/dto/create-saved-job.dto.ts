import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CreateSavedJobDto {
  @ApiProperty({
    description: 'User ID who is saving the job',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    description: 'Job post ID being saved',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  jobPostId: string;
}
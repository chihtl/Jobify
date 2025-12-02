import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Skill name',
    example: 'React.js',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category ID that this skill belongs to',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  categoryId: string;
}
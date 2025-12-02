import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../../../common/enums';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'New application status',
    enum: ApplicationStatus,
    example: ApplicationStatus.REVIEWED,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

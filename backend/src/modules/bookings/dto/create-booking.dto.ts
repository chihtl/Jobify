import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsMongoId,
  Min,
  Max,
} from 'class-validator';
import { BookingType } from '../schemas/booking.schema';

export class CreateBookingDto {
  @ApiProperty({ description: 'Candidate ID to book with' })
  @IsMongoId()
  @IsNotEmpty()
  candidateId: string;

  @ApiProperty({ description: 'Application ID (optional)', required: false })
  @IsOptional()
  @IsMongoId()
  applicationId?: string;

  @ApiProperty({
    description: 'Booking title',
    example: 'Interview for Senior Developer Position',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Booking description',
    example: 'Technical interview to discuss your experience and skills',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Scheduled date and time',
    example: '2024-12-01T10:00:00Z',
  })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 60,
    minimum: 15,
    maximum: 480,
  })
  @IsNumber()
  @Min(15)
  @Max(480) // Max 8 hours
  duration: number;

  @ApiProperty({
    description: 'Meeting location',
    required: false,
    example: 'Office Room 101',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Online meeting link',
    required: false,
    example: 'https://meet.google.com/abc-def-ghi',
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({
    description: 'Type of booking',
    enum: BookingType,
    example: BookingType.INTERVIEW,
  })
  @IsEnum(BookingType)
  type: BookingType;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

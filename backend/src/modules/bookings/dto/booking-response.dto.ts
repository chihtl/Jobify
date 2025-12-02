import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { BookingStatus, BookingType } from '../schemas/booking.schema';

class CompanyInfo {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  logoUrl?: string;
}

class CandidateInfo {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phone?: string;

  @ApiProperty()
  @Expose()
  avatarUrl?: string;
}

export class BookingResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  _id: string;

  @ApiProperty({ type: CompanyInfo })
  @Expose()
  @Type(() => CompanyInfo)
  companyId: CompanyInfo;

  @ApiProperty({ type: CandidateInfo })
  @Expose()
  @Type(() => CandidateInfo)
  candidateId: CandidateInfo;

  @ApiProperty()
  @Expose()
  applicationId?: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  scheduledDate: Date;

  @ApiProperty()
  @Expose()
  duration: number;

  @ApiProperty()
  @Expose()
  location?: string;

  @ApiProperty()
  @Expose()
  meetingLink?: string;

  @ApiProperty({ enum: BookingType })
  @Expose()
  type: BookingType;

  @ApiProperty({ enum: BookingStatus })
  @Expose()
  status: BookingStatus;

  @ApiProperty()
  @Expose()
  notes?: string;

  @ApiProperty()
  @Expose()
  candidateResponse?: string;

  @ApiProperty()
  @Expose()
  respondedAt?: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @Exclude()
  __v: number;

  constructor(partial: Partial<BookingResponseDto>) {
    Object.assign(this, partial);
  }
}

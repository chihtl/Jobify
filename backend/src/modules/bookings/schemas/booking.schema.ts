import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum BookingType {
  INTERVIEW = 'interview',
  MEETING = 'meeting',
  PHONE_CALL = 'phone_call',
  VIDEO_CALL = 'video_call',
}

@Schema({ collection: 'bookings', timestamps: true })
export class Booking extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Application', required: false })
  applicationId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop({ required: true })
  duration: number; // in minutes

  @Prop({ required: false })
  location?: string;

  @Prop({ required: false })
  meetingLink?: string;

  @Prop({
    type: String,
    enum: Object.values(BookingType),
    default: BookingType.INTERVIEW,
  })
  type: BookingType;

  @Prop({
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Prop({ required: false })
  notes?: string;

  @Prop({ required: false })
  candidateResponse?: string;

  @Prop({ required: false })
  respondedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Add indexes for better query performance
BookingSchema.index({ companyId: 1, candidateId: 1 });
BookingSchema.index({ scheduledDate: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });

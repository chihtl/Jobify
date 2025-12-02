import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApplicationStatus } from '../../../common/enums';
import { BaseSchema } from '../../../common/schemas/base.schema';
import { JobPost } from '../../job-posts/schemas/job-post.schema';
import { User } from '../../users/schemas/user.schema';

export type ApplicationDocument = Application & Document;

@Schema({ collection: 'applications', timestamps: true })
export class Application extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobPost', required: true })
  jobPostId: Types.ObjectId;

  @Prop()
  message?: string;

  @Prop()
  resumeUrl?: string;

  @Prop({
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  // Virtual populates
  user?: User;
  jobPost?: JobPost;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

// Add virtual for user
ApplicationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Add virtual for jobPost
ApplicationSchema.virtual('jobPost', {
  ref: 'JobPost',
  localField: 'jobPostId',
  foreignField: '_id',
  justOne: true,
});

// Add compound index to prevent duplicate applications
ApplicationSchema.index({ userId: 1, jobPostId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1 });
ApplicationSchema.index({ jobPostId: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });

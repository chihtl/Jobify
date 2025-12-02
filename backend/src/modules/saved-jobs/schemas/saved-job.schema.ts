import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { JobPost } from '../../job-posts/schemas/job-post.schema';
import { User } from '../../users/schemas/user.schema';

export type SavedJobDocument = SavedJob & Document;

@Schema({ collection: 'saved_jobs', timestamps: true })
export class SavedJob extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobPost', required: true })
  jobPostId: Types.ObjectId;

  @Prop({ default: Date.now })
  savedAt: Date;

  // Virtual populates
  user?: User;
  jobPost?: JobPost;
}

export const SavedJobSchema = SchemaFactory.createForClass(SavedJob);

// Add virtual for user
SavedJobSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Add virtual for jobPost
SavedJobSchema.virtual('jobPost', {
  ref: 'JobPost',
  localField: 'jobPostId',
  foreignField: '_id',
  justOne: true,
});

// Add compound index to prevent duplicate saves
SavedJobSchema.index({ userId: 1, jobPostId: 1 }, { unique: true });
SavedJobSchema.index({ userId: 1 });
SavedJobSchema.index({ jobPostId: 1 });
SavedJobSchema.index({ savedAt: -1 });
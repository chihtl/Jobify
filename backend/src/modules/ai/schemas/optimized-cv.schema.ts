import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type OptimizedCVDocument = OptimizedCV & Document;

@Schema({ collection: 'optimized_cvs', timestamps: true })
export class OptimizedCV extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobPost', required: true })
  jobId: Types.ObjectId;

  @Prop({ required: true })
  resumeUrl: string;

  @Prop({ type: [String], required: true })
  strengths: string[];

  @Prop({ type: [String], required: true })
  weakness: string[];

  @Prop({ type: [String], required: true })
  suggests: string[];

  @Prop({ default: Date.now })
  analyzedAt: Date;

  // Optional: Store job and CV snapshots for reference
  @Prop({ type: Object })
  jobSnapshot?: {
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
  };

  @Prop()
  cvTextPreview?: string; // First 500 chars for reference
}

export const OptimizedCVSchema = SchemaFactory.createForClass(OptimizedCV);

// Add compound index for efficient lookups
OptimizedCVSchema.index({ userId: 1, jobId: 1 }, { unique: true });
OptimizedCVSchema.index({ analyzedAt: -1 });

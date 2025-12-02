import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type FilteredUsersByAIDocument = FilteredUsersByAI & Document;

@Schema({ collection: 'filtered_users_by_ai', timestamps: true })
export class FilteredUsersByAI extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'JobPost', required: true })
  jobId: Types.ObjectId;

  @Prop({ required: true })
  jobDescription: string;

  @Prop({ type: [Number], required: true })
  jobEmbedding: number[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        location: String,
        bio: String,
        avatarUrl: String,
        resumeUrl: String,
        score: { type: Number, required: true },
      },
    ],
    required: true,
  })
  rankedUsers: Array<{
    userId: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatarUrl?: string;
    resumeUrl?: string;
    score: number;
  }>;

  @Prop({ default: Date.now })
  analyzedAt: Date;

  // Optional: Store job snapshot for reference
  @Prop({ type: Object })
  jobSnapshot?: {
    title: string;
    company: string;
    requirements: string[];
    skills: string[];
  };
}

export const FilteredUsersByAISchema = SchemaFactory.createForClass(FilteredUsersByAI);

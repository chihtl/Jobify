import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExperienceLevel, JobType } from '../../../common/enums';
import { BaseSchema } from '../../../common/schemas/base.schema';
import { Category } from '../../categories/schemas/category.schema';
import { Company } from '../../companies/schemas/company.schema';
import { Skill } from '../../skills/schemas/skill.schema';

export type JobPostDocument = JobPost & Document;

@Schema({ collection: 'job_posts', timestamps: true })
export class JobPost extends BaseSchema {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'Skill' }])
  skillIds: Types.ObjectId[];

  @Prop()
  location?: string;

  @Prop({ min: 0 })
  salaryMin?: number;

  @Prop({ min: 0 })
  salaryMax?: number;

  @Prop({ enum: Object.values(JobType), default: JobType.FULL_TIME })
  jobType: JobType;

  @Prop({ enum: Object.values(ExperienceLevel), default: ExperienceLevel.MID })
  experienceLevel: ExperienceLevel;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Prop()
  expiresAt?: Date;

  @Prop([String])
  requirements?: string[];

  @Prop([String])
  benefits?: string[];

  // Virtual populates
  company?: Company;
  category?: Category;
  skills?: Skill[];
}

export const JobPostSchema = SchemaFactory.createForClass(JobPost);

// Add virtual for company
JobPostSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
});

// Add virtual for category
JobPostSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

// Add virtual for skills
JobPostSchema.virtual('skills', {
  ref: 'Skill',
  localField: 'skillIds',
  foreignField: '_id',
});

// Add indexes for performance
JobPostSchema.index({ title: 'text', description: 'text' });
JobPostSchema.index({ companyId: 1 });
JobPostSchema.index({ categoryId: 1 });
JobPostSchema.index({ skillIds: 1 });
JobPostSchema.index({ location: 1 });
JobPostSchema.index({ jobType: 1 });
JobPostSchema.index({ experienceLevel: 1 });
JobPostSchema.index({ isActive: 1 });
JobPostSchema.index({ status: 1 });
JobPostSchema.index({ createdAt: -1 });

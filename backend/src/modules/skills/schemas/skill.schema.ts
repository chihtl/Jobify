import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';
import { Category } from '../../categories/schemas/category.schema';

export type SkillDocument = Skill & Document;

@Schema({ collection: 'skills', timestamps: true })
export class Skill extends BaseSchema {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  // Virtual populate for category
  category?: Category;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);

// Add virtual for category
SkillSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});
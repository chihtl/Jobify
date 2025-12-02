import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type CategoryDocument = Category & Document;

@Schema({ collection: 'categories', timestamps: true })
export class Category extends BaseSchema {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

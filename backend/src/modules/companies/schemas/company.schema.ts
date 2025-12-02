import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type CompanyDocument = Company & Document;

@Schema({ collection: 'companies', timestamps: true })
export class Company extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  logoUrl?: string;

  @Prop()
  websiteUrl?: string;

  @Prop()
  phone?: string;

  @Prop()
  location?: string;

  @Prop()
  description?: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

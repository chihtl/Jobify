import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type UserDocument = User & Document;

export class Experience {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  company: string;

  @Prop()
  location?: string;

  @Prop({ required: true })
  startDate: string;

  @Prop()
  endDate?: string;

  @Prop({ default: false })
  current: boolean;

  @Prop()
  description?: string;
}

@Schema({ collection: 'users', timestamps: true })
export class User extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  phone?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  resumeUrl?: string;

  @Prop()
  location?: string;

  @Prop()
  bio?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Skill', default: [] })
  skillIds?: Types.ObjectId[];

  @Prop({ type: [Experience], default: [] })
  experiences?: Experience[];

  @Prop({ type: [Number] })
  embedding?: number[];

  @Prop({ default: true })
  isActive?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

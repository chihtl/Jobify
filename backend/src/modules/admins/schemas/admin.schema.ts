import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdminRole } from '../../../common/enums';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type AdminDocument = Admin & Document;

@Schema({ collection: 'admins', timestamps: true })
export class Admin extends BaseSchema {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ enum: Object.values(AdminRole), default: AdminRole.MODERATOR })
  role: AdminRole;

  @Prop()
  name?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

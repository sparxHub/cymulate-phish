import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttemptDocument = HydratedDocument<Attempt>;
export type AttemptStatus = 'CREATED' | 'SENT' | 'CLICKED' | 'FAILED';

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ required: true, lowercase: true }) recipientEmail: string;
  @Prop({ default: 'Security Awareness Test' }) subject: string;
  @Prop({ default: '<p>Hi,<br/><a href="#">Open</a></p>' }) body: string;
  @Prop({ default: 'CREATED' }) status: AttemptStatus;
  @Prop() token?: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop() sentAt?: Date;
  @Prop() clickedAt?: Date;
  @Prop() error?: string;
}
export const AttemptSchema = SchemaFactory.createForClass(Attempt);
AttemptSchema.index({ token: 1 }, { unique: true, sparse: true });

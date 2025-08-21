import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type AttemptDocument = HydratedDocument<Attempt>;
@Schema({ collection: 'attempts' })
export class Attempt {
  @Prop() recipientEmail: string;
  @Prop() subject: string;
  @Prop() body: string;
  @Prop() status: string;
  @Prop() token?: string;
  @Prop() sentAt?: Date;
  @Prop() clickedAt?: Date;
}
export const AttemptSchema = SchemaFactory.createForClass(Attempt);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DEFAULT_AVATAR } from 'src/constants/constants';

@Schema()
export class User extends Document {
  @Prop({ type: String })
  fullName: string;

  @Prop({ index: true, unique: true, type: String })
  email: string;

  @Prop({
    index: true,
    type: String,
  })
  phoneNumber: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String, default: DEFAULT_AVATAR })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

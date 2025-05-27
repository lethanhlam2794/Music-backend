// src/music/music.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString,IsEnum, IsOptional } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose'; // Import Schema as MongooseSchema
import { MUSIC_GENRES } from 'src/constants/constants';

@Schema()
export class MusicModel extends Document {
  @Prop({ required: true })
  @IsString()
  title: string;

  @Prop({ required: true })
  @IsString()
  artist: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalname: string;


  @Prop({ required: true })
  storageName: string;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  lyrics: string;

  @Prop({ required: true, enum: MUSIC_GENRES })
  @IsEnum(MUSIC_GENRES)
  genre: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' }) // Tham chiếu đến User model
  uploadedBy: string;

  @Prop({ type: Number, default: 0 }) // Thêm trường likes
  likes: number;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  likedBy: string[];

  @Prop()
  avatarMusic: string; // Thêm trường avatar
}

export const MusicSchema = SchemaFactory.createForClass(MusicModel);
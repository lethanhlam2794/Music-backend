// src/music/music.module.ts

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { MusicModel,MusicSchema } from './music.model';

@Module({
  imports: [
    MulterModule.register({
      dest: './tmp',
    }),
    MongooseModule.forFeature([{ name:  MusicModel.name, schema: MusicSchema }]),
  ],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}

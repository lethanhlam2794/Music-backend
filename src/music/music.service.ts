// src/music/music.service.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createReadStream, existsSync } from 'fs';
import { Model } from 'mongoose';
import { getStoragePath } from 'src/constants/storage';
import { MusicModel } from './music.model';

@Injectable()
export class MusicService {
  constructor(@InjectModel(MusicModel.name) private musicModel: Model<MusicModel>) {}

  async saveFile(file: Express.Multer.File, title: string, artist: string, genre: string, storageName: string,lyrics: string, userId: string,avatarStorageName: string ) { // Thêm userId vào tham số
    const newMusic = new this.musicModel({
      title,
      artist,
      genre,
      filename: file.filename,
      originalname: file.originalname,
      storageName,
      lyrics,
      uploadedBy: userId,
      avatarMusic: avatarStorageName,
    });
    await newMusic.save();
    return {
      message: 'File uploaded successfully',
      musicId: newMusic._id,
    };
  }

  async getMusicStream(musicId: string) {
    const music = await this.musicModel.findById(musicId);
    if (!music) {
      return null;
    }

    const filePath = getStoragePath(music.storageName);
    if (!existsSync(filePath)) {
      return null;
    }

    return createReadStream(filePath);
  }

  async getRecentMusic() {
    const musicList = await this.musicModel.find().exec();
    return musicList
      .map((music) => {
        if (!music.storageName) {
          return {
            id: music._id,
            title: music.title,
            artist: music.artist,
            filename: music.filename,
            originalname: music.originalname,
            likes: music.likes,

            storageName: 'Không xác định (thiếu tên tệp)',
            status: 'Không tồn tại',
          };
        }

        const filePath = getStoragePath(music.storageName);
        const fileExists = existsSync(filePath);

        if (!fileExists) {
          return {
            id: music._id,
            title: music.title,
            artist: music.artist,
            filename: music.filename,
            likes: music.likes,
            originalname: music.originalname,

            storageName: `${music.storageName} (Không còn tồn tại)`,
            status: 'Không tồn tại',
          };
        }

        return {
          id: music._id,
          title: music.title,
          artist: music.artist,
          filename: music.filename,
          likes: music.likes,
          originalname: music.originalname,
          storageName: music.storageName,

          status: 'Available',
          lyrics: 'Lời bài hát...',
        };
      })
      .filter((music) => music.status === 'Available' || music.status === 'Không tồn tại');
  }


  async toggleLike(musicId: string, userId: string) {
    const music = await this.musicModel.findById(musicId) as MusicModel; // Ép kiểu cho music
    if (!music) {
      throw new HttpException('Music not found', HttpStatus.NOT_FOUND);
    }

    const index = music.likedBy.indexOf(userId);
    if (index > -1) {
      music.likedBy.splice(index, 1);
      music.likes -= 1;
    } else {
      music.likedBy.push(userId);
      music.likes += 1;
    }

    await music.save();
    return { message: 'Like toggled successfully', likes: music.likes };
  }

  async getTop10LikedSongs(): Promise<MusicModel[]> {
    return this.musicModel
      .find()
      .sort({ likes: -1 }) // Sắp xếp theo thứ tự giảm dần của lượt thích
      .limit(10) // Giới hạn kết quả là 10
      .exec();
  }
  async findMusicById(id: string) {
    return this.musicModel.findById(id).exec();
  }

  async getLikes(musicId: string): Promise<number> {
    const music = await this.musicModel.findById(musicId);
    if (!music) {
      throw new HttpException('Music not found', HttpStatus.NOT_FOUND);
    }
    return music.likes;
  }

  async findMusicByGenre(genre: string) {
    // return this.musicModel.find({ genre }).exec();
    const musicList = await this.musicModel.find({ genre }).exec();
    return musicList
      .map((music) => {
        if (!music.storageName) {
          return {
            id: music._id,
            title: music.title,
            artist: music.artist,
            filename: music.filename,
            originalname: music.originalname,
            likes: music.likes,

            storageName: 'Không xác định (thiếu tên tệp)',
            status: 'Không tồn tại',
          };
        }

        const filePath = getStoragePath(music.storageName);
        const fileExists = existsSync(filePath);

        if (!fileExists) {
          return {
            id: music._id,
            title: music.title,
            artist: music.artist,
            filename: music.filename,
            likes: music.likes,
            originalname: music.originalname,

            storageName: `${music.storageName} (Không còn tồn tại)`,
            status: 'Không tồn tại',
          };
        }

        return {
          id: music._id,
          title: music.title,
          artist: music.artist,
          filename: music.filename,
          likes: music.likes,
          originalname: music.originalname,
          storageName: music.storageName,

          status: 'Available',
          lyrics: 'Lời bài hát...',
        };
      })
      .filter((music) => music.status === 'Available' || music.status === 'Không tồn tại');
  }




}

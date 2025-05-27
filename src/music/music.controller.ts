// src/music/music.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Param,
  Res,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { createReadStream, existsSync, renameSync } from 'fs';
import { join } from 'path';
import { MUSIC_GENRES } from 'src/constants/constants';
import { getStorageAvatarMusicPath, getStoragePath } from 'src/constants/storage';
import { MusicService } from './music.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

const sanitizeHtml = require('sanitize-html'); // Sử dụng require để đảm bảo tương thích

@Controller('music')



export class MusicController {
  constructor(private readonly musicService: MusicService) { }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 }, // Xử lý file nhạc
      { name: 'avatar', maxCount: 1 }, // Xử lý avatar
    ]),
  )
  @ApiOperation({ summary: 'Upload a music file with avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        artist: { type: 'string' },
        genre: { type: 'string', enum: MUSIC_GENRES },
        lyrics: { type: 'string', example: 'Chưa cập nhật lời bài hát' },
        file: { type: 'string', format: 'binary' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadMusic(
    @UploadedFiles() files: { file?: Express.Multer.File[]; avatar?: Express.Multer.File[] },
    @Body('title') rawTitle: string,
    @Body('artist') rawArtist: string,
    @Body('genre') rawGenre: string,
    @Body('lyrics') rawLyrics: string,
    @Request() req: any,
  ) {
    // Lấy file và avatar từ đối tượng files
    const file = files.file?.[0];
    const avatar = files.avatar?.[0];

    if (!file || !avatar) {
      throw new HttpException('Both music file and avatar are required.', HttpStatus.BAD_REQUEST);
    }

    // Làm sạch dữ liệu đầu vào
    const title = sanitizeHtml(rawTitle, { allowedTags: [], allowedAttributes: {} });
    const artist = sanitizeHtml(rawArtist, { allowedTags: [], allowedAttributes: {} });
    const genre = sanitizeHtml(rawGenre, { allowedTags: [], allowedAttributes: {} });
    const lyrics = sanitizeHtml(rawLyrics, { allowedTags: [], allowedAttributes: {} });

    // Kiểm tra genre hợp lệ
    if (!MUSIC_GENRES.includes(genre)) {
      throw new HttpException('Invalid genre', HttpStatus.BAD_REQUEST);
    }

    // Chuẩn hóa tên nghệ sĩ và tiêu đề
    const formatString = (str: string) =>
      str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const standardizedArtist = formatString(artist);
    const standardizedTitle = formatString(title);


    const titleArr = standardizedTitle.replace(/\s/g, '');
    const artistArr = standardizedArtist.replace(/\s/g, '');

    // Xử lý tên file nhạc
    const ext = file.originalname.split('.').pop();
    const finalName = `${titleArr}-${artistArr}-${randomUUID()}.${ext}`;
    renameSync(join(file.destination, file.filename), getStoragePath(finalName));

    // Xử lý tên file avatar
    const avatarExt = avatar.originalname.split('.').pop();
    const avatarFinalName = `${finalName}avatar.${avatarExt}`;
    renameSync(join(avatar.destination, avatar.filename), getStorageAvatarMusicPath(avatarFinalName));

    // Lưu vào database
    return this.musicService.saveFile(file, standardizedTitle, standardizedArtist, genre, finalName, lyrics, req.user.userId, avatarFinalName);
  }


  @Get('stream/:id')
  @ApiOperation({ summary: 'Stream a music file' })
  async streamMusic(@Param('id') id: string, @Res() res: any) { // Use any for res
    const fileStream = await this.musicService.getMusicStream(id);
    if (!fileStream) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `inline; filename="${id}"`,
    });

    fileStream.pipe(res);
  }

  @Get('avatar/:id')
  @ApiOperation({ summary: 'Get avatar image by music ID' })
  async getAvatar(@Param('id') id: string, @Res() res: Response) {
    if (!id || id === 'undefined') {
      throw new HttpException('Invalid music ID', HttpStatus.BAD_REQUEST);
    }
    // Tìm thông tin nhạc dựa trên ID
    const music = await this.musicService.findMusicById(id);
    if (!music || !music.avatarMusic) {
      throw new HttpException('Avatar not found', HttpStatus.NOT_FOUND);
    }

    const filePath = getStorageAvatarMusicPath(music.avatarMusic);

    // Kiểm tra file tồn tại
    if (!existsSync(filePath)) {
      throw new HttpException('Avatar file not found', HttpStatus.NOT_FOUND);
    }

    // Set Content-Type phù hợp cho ảnh
    const ext = music.avatarMusic.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    res.header('Content-Type', mimeType);

    // Stream file ảnh về client
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get('likes/:id')
  @ApiOperation({ summary: 'Get the number of likes for a music' })
  async getLikes(@Param('id') musicId: string) {
    const likes = await this.musicService.getLikes(musicId);
    return { likes };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent uploaded music' })
  async getRecentMusic() {
    const recentMusic = await this.musicService.getRecentMusic();
    return recentMusic;
  }

  @Post('toggleLike/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like for a music' })
  async toggleLike(
    @Param('id') musicId: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId; // Có thể sử dụng userId để kiểm tra lượt thích của từng user nếu cần
    return this.musicService.toggleLike(musicId, userId);
  }


  @Get('top10')
  @ApiOperation({ summary: 'Get top 10 liked songs' })
  async getTop10LikedSongs() {
    return this.musicService.getTop10LikedSongs();
  }

  @Get('genre/:genre')
  @ApiOperation({ summary: 'Get music by genre' })
  async getMusicByGenre(@Param('genre') genre: string) {
    if (!MUSIC_GENRES.includes(genre)) {
      throw new HttpException('Invalid genre', HttpStatus.BAD_REQUEST);
    }
    return this.musicService.findMusicByGenre(genre);
  }


}

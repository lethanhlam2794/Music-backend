// import {
//   Controller,
//   Post,
//   UploadedFile,
//   UseInterceptors,
//   Get,
//   Query,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { FileService } from './file.service';
// import * as multer from 'multer';
// import { ApiConsumes, ApiBody } from '@nestjs/swagger'; // Import Swagger decorators

// @Controller('file')
// export class FileController {
//   constructor(private readonly fileService: FileService) {}

//   @Post('upload')
//   @ApiConsumes('multipart/form-data') // Định nghĩa kiểu dữ liệu
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         file: {
//           type: 'string',
//           format: 'binary', // Định nghĩa định dạng file
//         },
//       },
//     },
//   })
//   @UseInterceptors(
//     FileInterceptor('file', {
//       storage: multer.memoryStorage(),
//     }),
//   )
//   async uploadFile(@UploadedFile() file: Express.Multer.File) {
//     return this.fileService.processFile(file);
//   }

//   @Get('search')
//   async search(@Query('term') term: string) {
//     return this.fileService.searchInFile(term);
//   }
// }


// import { Injectable } from '@nestjs/common';
// import { InjectConnection } from '@nestjs/mongoose';
// import { Connection } from 'mongoose';
// import { GridFSBucket } from 'mongodb';
// import { createRequire } from 'module';


// @Injectable()
// export class FileService {
//   private gridFsBucket: GridFSBucket;

//   constructor(@InjectConnection() private readonly connection: Connection) {
//     this.gridFsBucket = new GridFSBucket(this.connection.db);
//   }

//   async processFile(file: Express.Multer.File) {
//     const uploadStream = this.gridFsBucket.openUploadStream(file.originalname);
//     uploadStream.end(file.buffer);

//     return {
//       message: 'File uploaded successfully',
//       fileId: uploadStream.id,
//     };
//   }

//   async searchInFile(searchTerm: string) {
//     const files = await this.gridFsBucket.find().toArray();
//     const results = [];

//     for (const file of files) {
//       const downloadStream = this.gridFsBucket.openDownloadStream(file._id);
//       const chunks: Buffer[] = [];

//       downloadStream.on('data', (chunk) => {
//         chunks.push(chunk);
//       });

//       await new Promise<void>((resolve, reject) => {
//         downloadStream.on('end', async () => {
//           const pdfBuffer = Buffer.concat(chunks);

//           const require = createRequire(import.meta.url);
// const pdfjsLib = require('pdfjs-dist');
//           const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

//           let fullText = '';
//           const numPages = pdfDoc.numPages;

//           for (let i = 1; i <= numPages; i++) {
//             const page = await pdfDoc.getPage(i);
//             const textContent = await page.getTextContent();

//             const strings = textContent.items
//               .filter((item: any) => 'str' in item)
//               .map((item: any) => item.str)
//               .join(' ');

//             fullText += strings + '\n';
//           }

//           if (fullText.includes(searchTerm)) {
//             results.push(file);
//           }
//           resolve();
//         });
//         downloadStream.on('error', reject);
//       });
//     }

//     return results;
//   }
// }

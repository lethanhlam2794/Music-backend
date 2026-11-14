import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';

// function convert(originalname: string) {
//   const originalnameArr = originalname.split('.');
//   console.log(`Before (.): ${originalnameArr}`)
//   let finalName = originalnameArr + '-' + randomUUID();
//   if (originalnameArr.length > 1) {
//     const ext = originalnameArr.pop();
//     console.log(`ext pop : ${ext}`)

//     finalName = `${originalnameArr.join('.')}-${randomUUID()}.${ext}`
//   }
//   console.log(`Before: ${originalname}`);
//   console.log(`After: ${finalName}`);
// }

// convert('abc.mp3')
// convert('abc.23.ss.mp3')
// convert('abcdef')
// convert('abc hai dep trai.mp3')


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalInterceptors(new HttpLoggingInterceptor());
  const port = process.env.PORT || 3000;
  const mainUrl = `http://localhost:${port}`;
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép yêu cầu từ domain này
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép gửi cookie
  });

  // Swagger config.
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true';
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Music API')
      .setDescription('API for music platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    console.log(`Swagger API documentation is running on ${mainUrl}/api`);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`Server is listening on ${mainUrl}`);
}

bootstrap();

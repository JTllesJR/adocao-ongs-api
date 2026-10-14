import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta campos fora do DTO
      forbidNonWhitelisted: true, // e responde 400 se vierem
      transform: true, // converte query/params para os tipos do DTO
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Adoção de Animais com ONGs')
    .setDescription('ONGs, abrigos, animais, adotantes, processos de adoção, visitas, termos e acompanhamentos.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API: http://localhost:${port}  |  Swagger: http://localhost:${port}/docs`);
}
bootstrap();

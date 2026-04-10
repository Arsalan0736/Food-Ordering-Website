import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Required for Frontend tests!
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();

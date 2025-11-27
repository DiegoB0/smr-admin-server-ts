import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = process.env.FRONTEND_URL;

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: "Content-Type, Authorization, X-API-Key",
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SMR_APIDocs')
    .setDescription('API for SMR products')
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Token',
      },
      'jwt',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Enter API Key',
      },
      'api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (process.env.PROD !== 'true') {
    SwaggerModule.setup('api/docs', app, document);
    console.log(
      `Swagger Docs available at http://localhost:${process.env.PORT ?? 5000}/api/docs`,
    );
  } else {
    console.log('Swagger disabled in PROD mode');
  }

  await app.listen(process.env.PORT ?? 5000);
  console.log(
    `🚀 Application running on http://localhost:${process.env.PORT ?? 5000}`,
  );
}
bootstrap();

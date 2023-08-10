import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './common/auth/auth.module';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { FileUtils } from './common/lib/file-utils';
import { diskStorage } from 'multer';
import { NoGeneratorUtils } from './common/lib/no-generator-utils';
import { JwtAuthGuard } from './common/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
    }),
    MulterModule.register({
      dest: FileUtils.FilePath,
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const uploadPath = FileUtils.FilePath;
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath);
          }
          cb(null, uploadPath);
        },
        filename: async (req: any, file: any, cb: any) => {
          cb(
            null,
            `${await NoGeneratorUtils.generateCode(16)}${extname(
              file.originalname,
            )}`,
          );
        },
      }),
    }),
    DatabaseModule,
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

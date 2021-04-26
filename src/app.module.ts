import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), FileModule, BullModule.forRoot({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

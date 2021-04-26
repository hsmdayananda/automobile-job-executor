
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bull';
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import { Module, HttpModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./file.entity";
import { FileProcessor } from './file.processor';


@Module({
    imports: [TypeOrmModule.forFeature([FileEntity]),
    BullModule.registerQueue({
        name: 'uploader',
    }), BullModule.registerQueue({
        name: 'file-processor',
    }), MulterModule.register({
        dest: '../data',
    }), HttpModule],
    controllers: [FileController],
    providers: [FileService, FileProcessor]
})

export class FileModule {

}
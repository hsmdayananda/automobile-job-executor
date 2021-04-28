
import { MulterModule } from '@nestjs/platform-express';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import { Module, HttpModule, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./file.entity";
import { FileProcessor } from './file.processor';
import { Queue } from 'bull';
import { BullAdapter } from 'bull-board/bullAdapter';
import { createBullBoard } from 'bull-board';

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
    route: any;
    constructor(@InjectQueue('file-processor') private fileQueue: Queue) {
        const { router } = createBullBoard([
            new BullAdapter(fileQueue)
        ])

        this.route = router;
    }
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(this.route).forRoutes('/admin/queues');
    }

}
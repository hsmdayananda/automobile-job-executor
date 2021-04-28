import { Controller, Post, Body } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { FileService } from "./file.service";


@Controller('file')
export class FileController {

    constructor(@InjectQueue('file-processor') private readonly fileProcQueue: Queue, private fileService: FileService) {
    }

    @Post('upload')
    async uploadFile(@Body() file) {
        await this.fileProcQueue.add('upload', {
            file: file,
        }, { delay: 5000 });

    }

    @Post('download')
    async downloadFile(@Body() criteria: any) {
        await this.fileProcQueue.add('download', {
            criteria: criteria,
        }, {
            delay: 5000
        });


    }
}
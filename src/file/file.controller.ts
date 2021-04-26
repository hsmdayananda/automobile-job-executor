import { Controller, Post, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from "./file.service";

@Controller('file')
export class FileController {

    constructor(@InjectQueue('file-processor') private readonly fileProcQueue: Queue, private fileService: FileService) { }

    @Post('upload')
    // @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@Body() file) {
        console.log(' hello file', file)
        await this.fileProcQueue.add('upload', {
            file: file,
        });

    }

    @Post('download')
    async downloadFile(@Body() criteria: any) {
        console.log(' hello critiriea')
        await this.fileProcQueue.add('download', {
            criteria: criteria,

        });


    }
}
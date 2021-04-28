import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueError } from '@nestjs/bull';
import { Logger, HttpService } from '@nestjs/common';
import { Job } from 'bull';
import { FileService } from './file.service';


@Processor('file-processor')
export class FileProcessor {
    constructor(private fileService: FileService, private httpService: HttpService) { }
    private readonly logger = new Logger(FileProcessor.name);

    status: boolean = true;
    @Process('upload')
    async handleUpload(job: Job) {
        this.logger.debug('Start uploading...');
        await this.fileService.bulkUpload(job.data.file);
    }

    @Process('download')
    handleDownload(job: Job) {
        this.logger.debug('Start downloading...');
        this.fileService.filterData(job.data);
    }

    @OnQueueActive({ name: 'upload' })
    onActiveUpload(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );

    }

    @OnQueueError({ name: 'upload' })
    onError(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }


    @OnQueueCompleted({ name: 'upload' })
    async onCompleteUpload(job: Job, result: any) {
        let socketObj = {
            event: 'file-upolad',
            data: {
                message: 'File Upload Success'
            }
        }
        this.logger.debug(`completed job ${job.id} of type ${job.name} with data ${job.data}...}`);
        let res = this.httpService.post('http://localhost:4003/websocket-gateway/send-message', socketObj);
        res.subscribe((data) => {
            //  console.log(data)
        })

    }

    @OnQueueFailed({ name: 'upload' })
    onFailUpload(job: Job) {
        //this.eventGateway.wss.emit('file-read', 'failed');
        let socketObj = {
            event: 'file-upolad',
            data: {
                message: 'File Upload Failed'
            }
        }
        console.log(
            `failed  job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
        let res = this.httpService.post('http://localhost:4003/websocket-gateway/send-message', socketObj);
        res.subscribe((data) => {
            // console.log(data)
        })
    }

    @OnQueueActive({ name: 'download' })
    onActiveDownload(job: Job) {
        this.logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...}`);
    }


    @OnQueueCompleted({ name: 'download' })
    async onCompleteDownload(job: Job, result: any) {
        let socketObj = {
            event: 'file-download',
            data: {
                message: 'File Redy to Download'
            }
        }
        this.logger.debug(`completed job ${job.id} of type ${job.name} with data ${job.data}...}`);
        let res = this.httpService.post('http://localhost:4003/websocket-gateway/send-message', socketObj);
        res.subscribe((data) => {
            //console.log(data)
        })

    }

    @OnQueueFailed({ name: 'download' })
    onFailDownload(job: Job) {
        let socketObj = {
            event: 'file-upolad',
            data: {
                message: 'File Upload Failed'
            }
        }
        console.log(
            `failed  job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
        let res = this.httpService.post('http://localhost:4003/websocket-gateway/send-message', socketObj);
        res.subscribe((data) => {
            // console.log(data)
        })
    }
}
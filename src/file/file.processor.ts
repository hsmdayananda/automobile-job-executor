import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger, HttpService } from '@nestjs/common';
import { Job } from 'bull';
import { FileService } from './file.service';




@Processor('file-processor')
export class FileProcessor {
    constructor(private fileService: FileService, private httpService: HttpService) { }
    private readonly logger = new Logger(FileProcessor.name);

    @Process('upload')
    handleUpload(job: Job) {
        this.logger.debug('Start uploading...');
        this.fileService.bulkUpload(job.data.file);
        this.logger.debug('Uploading completed');
    }

    @Process('download')
    handleDownload(job: Job) {
        this.logger.debug('Start downloading...');
        this.fileService.filterData(job.data);
        this.logger.debug('Download completed');
    }

    @OnQueueActive({ name: 'upload' })
    onActiveUpload(job: Job) {
        //this.eventGateway.wss.emit('files', { name: 'Active' });
        let socketObj = {
            event: 'file-upolad',
            data: {
                message: 'File Uploa Success'
            }
        }
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
        //this.eventGateway.wss.emit('files', { name: 'uploaded' });
        console.log(
            `completed job ${job.id} of type ${job.name} with data ${job.data}...}`,
        );
        let res = this.httpService.post('http://localhost:4003/websocket-gateway/send-message', socketObj);
        return res.subscribe((data) => { console.log(' data res ', data) })

    }

    @OnQueueFailed({ name: 'upload' })
    onFailUpload(job: Job) {
        //this.eventGateway.wss.emit('file-read', 'failed');
        console.log(
            `failed  job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }

    @OnQueueActive({ name: 'download' })
    onActiveDownload(job: Job) {
        //this.eventGateway.wss.emit('files', { name: 'Active' });
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }


    @OnQueueCompleted({ name: 'download' })
    async onCompleteDownload(job: Job, result: any) {
        //this.eventGateway.wss.emit('files', { name: 'uploaded' });
        let socketObj = {
            event: 'file-download',
            data: {
                message: 'File Redy to Download'
            }
        }
        console.log(
            `completed job ${job.id} of type ${job.name} with data ${job.data}...}`,
        );
        let res = this.httpService.post('http://localhost:4003/websocket-gateway/send-message', socketObj);
        return res.subscribe((data) => { console.log(' data res ', data) })

    }

    @OnQueueFailed({ name: 'download' })
    onFailDownload(job: Job) {
        //this.eventGateway.wss.emit('file-read', 'failed');
        console.log(
            `failed  job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }
}
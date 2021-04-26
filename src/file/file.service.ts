import { Injectable, HttpService } from "@nestjs/common";
import { Repository, getConnection } from "typeorm";
import { FileEntity } from "./file.entity";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from 'fs';
import * as csv from 'fast-csv';
const Json2csvParser = require('json2csv').Parser;
import { request, gql } from 'graphql-request'

@Injectable()
export class FileService {
    url = 'http://localhost:5000/graphql';

    constructor(@InjectRepository(FileEntity) private autoMobileRepo: Repository<FileEntity>, private httpService: HttpService) { }

    async bulkUpload(jobData: Express.Multer.File) {
        const automobiles = [];
        fs.createReadStream(jobData.path).

            pipe(csv.parse({ headers: true }))
            .on('error', error => {
                console.error(error);
                throw error.message;
            })
            .on('data', row => {
                //console.log("data row", row);
                automobiles.push(row);
            })
            .on('end', async () => {
                // Save automobiles to PostgreSQL database
                //console.log('table data', automobiles);
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(FileEntity)
                    .values(
                        //pass list of automobiles
                        automobiles

                    )
                    .execute().finally(() => {
                        //console.log("job done")

                    });
            });


    }

    async filterData(input: any) {
        console.log(' input filter', input)

        let query = gql`
            {
                allAutomobileEntities(
                  filter:{${input.criteria.filterField}: {${input.criteria.operator}: ${input.criteria.value}}} 
                ) {
                  nodes {
                    ageOfVehicle
                    carMake
                    created
                    id
                    email
                    lastName
                    carModel
                    firstName
                    manufacturedDate
                    vinNumber
                  }
                }
              }
            `

            ;

        console.log('my quer ', query)


        let out = await request(this.url, query);
        let data = out.allAutomobileEntities.nodes;
        let csv = await this.generateCsv(data);
        console.log('csv ', csv)
        return csv;
    }

    async generateCsv(data: any[]) {
        const jsonCustomers = JSON.parse(JSON.stringify(data));
        const csvFields = ['Id', 'First Name', 'Last Name'];
        const json2csvParser = new Json2csvParser({ csvFields });
        const csvData = json2csvParser.parse(jsonCustomers);

        this.writeToCSVFile(csvData);
    }
    async writeToCSVFile(data: any) {
        const filename = 'export-data.csv';
        fs.writeFile(filename, data, err => {
            if (err) {
                console.log('Error writing to csv file', err);
            } else {
                console.log(`saved as ${filename}`);
            }
        });
    }
}
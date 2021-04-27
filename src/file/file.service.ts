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
                automobiles.push(row);
            })
            .on('end', async () => {
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(FileEntity)
                    .values(
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
                    orderBy: MANUFACTURED_DATE_ASC
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
        let data = this.myFunction(out.allAutomobileEntities.nodes);
        let finalData = data.filter(
            (m) => {
                switch (input.criteria.operator) {

                    case ('lessThan'):
                        console.log(" ageOfVehicle ", m.ageOfVehicle)
                        return m.ageOfVehicle < input.criteria.value

                    case ('lessThanOrEqualTo'):
                        console.log(" ageOfVehicle ", m.ageOfVehicle)
                        return m.ageOfVehicle <= input.criteria.value

                    case ('greaterThan'):
                        console.log(" ageOfVehicle ", m.ageOfVehicle)
                        return m.ageOfVehicle > input.criteria.value

                    case ('greaterThanOrEqualTo'):
                        console.log(" ageOfVehicle ", m.ageOfVehicle)
                        return m.ageOfVehicle >= input.criteria.value

                }
            }
        );

        let csv = await this.generateCsv(finalData);
        return finalData;

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

    myFunction(data: any[]) {
        let arr: any = [];
        data.map((el) => {
            var today = new Date();
            var birthDate = new Date(el.manufacturedDate);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            console.log(' hello ', age)
            el.ageOfVehicle = age;
            return age;
        });
        //arr = arr2;
        console.log(' arr ', data)
        return data;

    }
}
import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { Manufacturer } from './manufacturer.model'
import { GetManufacturerFiterDto } from './dto/get-manufacturers-filter.dto';
import { getModelByIdWithImageDeleted }  from '../utils/common-helper'


@Injectable()
export class ManufacturersService {
    
    constructor(
        @InjectModel('Manufacturer')
        private manufacturerModel: Model<Manufacturer>
    ) {}

    async getManufacturer(filterManufacturer: GetManufacturerFiterDto){
        const { country } = filterManufacturer;
        const countries = country && country.split(',')
        let manufacturers;
        manufacturers =  await this.manufacturerModel.find().exec();
        if(countries) {
            manufacturers =  await this.manufacturerModel.aggregate([
                { $match: { country: { $in: countries } } }
            ])
        } 
        return manufacturers.map((manufacturer) => (
            {
                id: manufacturer._id,
                name: manufacturer.name,
                country: manufacturer.country,
                logo: manufacturer.logo
            }
        ))
    }

    async getManufacturerById(id: string) {

        const manufacturer = await this.findManufacturer(id);
        return {id: manufacturer.id, name: manufacturer.name, country: manufacturer.country, logo: manufacturer.logo}
    }

    async createManufacturer(createManufacturerDto: CreateManufacturerDto, logos) {
        const {name, country} = createManufacturerDto
        let logo = logos ? logos.path: '';

        const newManufacturer =  new this.manufacturerModel({name, country, logo});
        const result = await newManufacturer.save()
        return result.id;
    }
    
    async deleteManufacturer(id: string, res): Promise<void> {
        const found = await this.findManufacturer(id) 
        const deletedPreviousLogoFromStorage = found.logo
        await getModelByIdWithImageDeleted(id, deletedPreviousLogoFromStorage, this.manufacturerModel, null, res)
        await this.manufacturerModel.deleteOne({_id: id}).exec();

    }


    async updateManufacturer(id: string, createManufacturerDto: CreateManufacturerDto, logos, res) {
        const { name, country} = createManufacturerDto
        const updatedManufacturer = await this.findManufacturer(id) 
        const previous_logo = updatedManufacturer.logo
        
        if(name) {
            updatedManufacturer.name = name;
        }

        if(country) {
            updatedManufacturer.country = country;
        }

        if(logos && logos.path) {
            updatedManufacturer.logo = logos.path;
        }

        updatedManufacturer.save()

        if(logos && previous_logo) {
            await getModelByIdWithImageDeleted(id, previous_logo, this.manufacturerModel, updatedManufacturer, res)
        } else {
            res.send(updatedManufacturer)
        }
    }

    private async findManufacturer(id: string): Promise<Manufacturer> {
        let manufacturer;
        try {
            manufacturer = await this.manufacturerModel.findById(id).exec()
        } catch(error) {
            throw new NotFoundException('Could not find manufacturer.');
        }
        
        if (!manufacturer) {
          throw new NotFoundException('Could not find manufacturer.');
        }
        return manufacturer;
      }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { Car } from './car.model';
import { CreateCarDto, CreateBulkCarDto } from './dto/create-car.dto'
import { Manufacturer } from '../manufacturers/manufacturer.model'
import { GetCarFiterDto } from './dto/get-cars-filter.dto';
import { getModelByIdWithImageDeleted }  from '../utils/common-helper'
import * as _ from 'lodash';

@Injectable()
export class CarsService {

  constructor(
    @InjectModel('Car') private readonly carModel: Model<Car>,
    @InjectModel('Manufacturer') private readonly manufacturerModel: Model<Manufacturer>
    
    ){}

  async insertCar(createCarDto: CreateCarDto, mId: string, images) {
    let image = images ? images.path: '';
    let manufacturer;

    try {
      manufacturer = await this.manufacturerModel.findById(mId).exec()
    } catch(error) {
        throw new NotFoundException('Could not find manufacturer.');
    }

    const {name, year} = createCarDto;
    const newCar = await this.carModel.create({
        name,
        year,
        image,
        manufacturer
    });
    
    let result = await newCar.save()
    return result;
  }


  async bulkInsertCar(createBulkCarDto: CreateBulkCarDto[]) {

    const carsToInsert = await Promise.all(
          createBulkCarDto.map(async (car) => {
            const {name, year, manufacturerId} = car;
            try {
                await this.manufacturerModel.findById(manufacturerId).exec()
            } catch(error) {
                throw new NotFoundException(`Could not find manufacturer id '{${manufacturerId}}'`);
            }
            return {
                insertOne: {document: {name, year, manufacturer: manufacturerId} }
              }
      }
    )
    )

    await this.carModel.bulkWrite(
      carsToInsert,
      {ordered: false},
      (error, response) => {
        if(error) {
          console.warn(error)
        } else {
          console.log(response.insertedCount)
        }
      }
    )

  }

  async getCars(filterCar: GetCarFiterDto) {
    const { country } = filterCar;
    const countries = country && country.split(',')
    let cars;
    cars = await this.carModel.find().populate('manufacturer', this.manufacturerModel).exec();
    if(countries) {
      const Getcars = await this.carModel.find(
        {'manufacturer': { $exists: true, $ne: null }}
      ).populate({
        path: 'manufacturer',
        match: {
            country: { $in: countries }
        }
      }).exec();

      cars = _.filter(Getcars, (car) => (
          car.manufacturer !== null
        )) 
    }
    return cars.map((car)=> (
        {
            id: car.id,
            name: car.name,
            year: car.year,
            image: car.image,
            manufacturer: car.manufacturer ? {
              id: car.manufacturer.id,
              name: car.manufacturer.name,
              country: car.manufacturer.country
            } : "",
        }
    ));
  }

  async getGroupedByCar() {
    const cars = await this.carModel.aggregate([

        { $lookup: {
          from: "manufacturers",
          localField: "manufacturer",
          foreignField: "_id",
          as: 'manufacturers_cars'
        }},
      
        { "$unwind": "$manufacturers_cars" },

        {$group: {
            _id: {country: "$manufacturers_cars.country", 
                    manufacturer: "$manufacturer"},
            count: {$sum: 1}}
        },

        {$sort: {"_id.country": 1 , "count": 1}}

    ]).exec();

    return cars.map((data)=> (
      {
        id: data._id.manufacturer,
        country: data._id.country,
        total_cars_manufactured: data.count
      }
  ));
  }

  async getSingleCar(carId: string) {
    const car = await this.findCar(carId);
    return {id: car.id, name: car.name, year:car.year, manufacturer: car.manufacturer, image: car.image};
  }

  async updateCar(carId: string, name: string, year: string, mId: string, images, res) {
    let manufacturer;

    try {
      manufacturer = await this.manufacturerModel.findById(mId).exec()
    } catch(error) {
        throw new NotFoundException('Could not find manufacturer.');
    }

    let updatedcar;

    try {
      updatedcar = await this.findCar(carId);
    } catch(error) {
      throw new NotFoundException('Could not find car.');
    }

    const previous_image = updatedcar.image
    if (name) {
        updatedcar.name = name;
    }
    if (year) {
        updatedcar.year = year;
    }
    if (mId) {
      updatedcar.manufacturer = manufacturer;
    }
    if(images && images.path) {
      updatedcar.image = images.path;
    }

    updatedcar.save()

    if(images && previous_image) {
      await getModelByIdWithImageDeleted(carId, previous_image, this.carModel, updatedcar, res)
    } else {
      res.send(updatedcar)
    }
  }

  async deleteCar(carId: string, res) {
    const found = await this.findCar(carId)
    const deletedPreviousImageFromStorage = found.image;
    await getModelByIdWithImageDeleted(carId, deletedPreviousImageFromStorage, this.carModel, null, res)
    await this.carModel.deleteOne({_id: carId}).exec();
  }

  private async findCar(id: string): Promise<Car> {
    let car;
    try {
        car = await this.carModel.findById(id).exec()
    } catch(error) {
        throw new NotFoundException('Could not find car.');
    }
    
    if (!car) {
      throw new NotFoundException('Could not find car.');
    }
    return car;
  }

}
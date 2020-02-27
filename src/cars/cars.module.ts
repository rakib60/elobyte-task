import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'

import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { CarSchema } from './car.model';
import { ManufacturerSchema } from 'src/manufacturers/manufacturer.model';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'Car', schema: CarSchema},
      {name: 'Manufacturer', schema: ManufacturerSchema}
    ]),
    MulterModule.register({
      dest: './images'
    }),
  ],
  controllers: [CarsController],
  providers: [CarsService]
})
export class CarsModule {}

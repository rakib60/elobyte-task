import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'

import { CarsModule } from './cars/cars.module';
import { ManufacturersModule } from './manufacturers/manufacturers.module';

@Module({
  imports: [CarsModule, MongooseModule.forRoot(
    'mongodb+srv://rakibul60:rakib5500@cluster0-nowlu.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true,  useUnifiedTopology: true },
  ), ManufacturersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

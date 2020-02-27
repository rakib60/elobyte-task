import { Module } from '@nestjs/common';
import { ManufacturersController } from './manufacturers.controller';
import { ManufacturersService } from './manufacturers.service';
import { MongooseModule } from '@nestjs/mongoose'
import { ManufacturerSchema  } from './manufacturer.model'
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Manufacturer', schema: ManufacturerSchema}]),
    MulterModule.register({
      dest: './logos'
    }),
  ],
  controllers: [ManufacturersController],
  providers: [ManufacturersService]
})
export class ManufacturersModule {}

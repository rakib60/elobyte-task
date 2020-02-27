import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    Res,
    ValidationPipe,
    Query,
    UseInterceptors,
    UploadedFile,
    UsePipes,
  } from '@nestjs/common';
  
import { CarsService } from './cars.service';
import { diskStorage } from 'multer'
import { CreateCarDto, CreateBulkCarDto } from './dto/create-car.dto'
import { GetCarFiterDto } from './dto/get-cars-filter.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, fileSize, fileFilter } from 'src/utils/file-uploading.utils';

  @Controller('cars')
  export class CarsController {
    constructor(private readonly carsService: CarsService) {}
  
    @Post()
    @UsePipes(ValidationPipe)
    @UseInterceptors(
      FileInterceptor('image', {
        storage: diskStorage ({
          destination: './images',
          filename: editFileName,
        }),
        limits: {
          fileSize: fileSize
        },
        fileFilter: fileFilter
      }),
    )
    async addCar(
      @Body() createCarDto: CreateCarDto,
      @Body('manufacturerId') mId: string,
      @UploadedFile() image
    ) {
      const generatedData = await this.carsService.insertCar(
        createCarDto,
        mId,
        image
      );
      return {obj: generatedData};
    }

    @Post('bulk_create')
    async multiAddCar(
      @Body() createCarbulkDto: CreateBulkCarDto[],
    ) {
      const generatedId = await this.carsService.bulkInsertCar(
        createCarbulkDto
      );
      return generatedId;
    }

  
    @Get()
    async getAllCars(@Query(ValidationPipe) filterCar: GetCarFiterDto) {
      const cars = await this.carsService.getCars(filterCar);
      return cars;
    }

    @Get('groupedByView')
    async getAllCarsGroupByCountryThenByManufacturer() {
      const cars = await this.carsService.getGroupedByCar();
      return cars;
    }


    @Get(':id')
    getCar(@Param('id') carId: string) {
      return this.carsService.getSingleCar(carId);
    }
  
    @Patch(':id')
    @UseInterceptors(
      FileInterceptor('image', {
        storage: diskStorage ({
          destination: './images',
          filename: editFileName,
        }),
        limits: {
          fileSize: fileSize
        },
        fileFilter: fileFilter
      }),
    )
    async updateCar(
      @Param('id') carId: string,
      @Body('name') carName: string,
      @Body('year') year: string,
      @Body('manufacturerId') mId: string,
      @UploadedFile() image,
      @Res() res
    ) {
      await this.carsService.updateCar(carId, carName, year, mId, image, res);
      return null;
    }
  
    @Delete(':id')
    async removeCar(@Param('id') carId: string, @Res() res) {
        await this.carsService.deleteCar(carId, res);
        return null;
    }
  }
import { Controller, ValidationPipe, Query, Param, Body, Get, Post, UsePipes, Delete, Patch, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import {  editFileName, fileFilter, fileSize } from'../utils/file-uploading.utils'
import { GetManufacturerFiterDto } from './dto/get-manufacturers-filter.dto';
@Controller('manufacturers')
export class ManufacturersController {
    
    constructor(private manufacturerService: ManufacturersService){}

    @Get()
    async getManufacturer(@Query(ValidationPipe) filterManufacturer: GetManufacturerFiterDto) {
      return await this.manufacturerService.getManufacturer(filterManufacturer);
    }

    @Get('/:id')
    getManufacturerById(@Param('id') id: string) {
        return this.manufacturerService.getManufacturerById(id);
    }

    @Post()
    @UseInterceptors(
        FileInterceptor('logo', {
          storage: diskStorage ({
            destination: './logos',
            filename: editFileName,
          }),
          limits: {
            fileSize: fileSize
          },
          fileFilter: fileFilter
        }),
      )

    createManufacturer(@Body() createManufacturerDto: CreateManufacturerDto, @UploadedFile() logo) {
        return this.manufacturerService.createManufacturer(createManufacturerDto, logo);
    }


    @Delete('/:id')
    deleteManufacturer(@Param('id') id: string, @Res() res): Promise<void> {
        return this.manufacturerService.deleteManufacturer(id, res);
    }

    @Patch('/:id')
    @UseInterceptors(
        FileInterceptor('logo', {
          storage: diskStorage ({
            destination: './logos',
            filename: editFileName,
          }),
          limits: {
            fileSize: fileSize
          },
          fileFilter: fileFilter
        }),
      )
    async updateManufacturer(
        @Param('id') id: string,
        @Body() createManufacturerDto: CreateManufacturerDto,
        @UploadedFile() logo,
        @Res() res
    ){
        return await this.manufacturerService.updateManufacturer(id, createManufacturerDto, logo, res);
    }

}

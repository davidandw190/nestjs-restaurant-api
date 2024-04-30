import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './schema/restaurant.schema';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  async getRestaurants(@Query() query: ExpressQuery): Promise<Restaurant[]> {
    return this.restaurantService.findAll(query);
  }

  @Post()
  async createRestaurant(
    @Body()
    restaurant: CreateRestaurantDTO,
  ): Promise<Restaurant> {
    return this.restaurantService.create(restaurant);
  }

  @Get(':id')
  async getRestaurant(
    @Param('id')
    restaurantId: string,
  ): Promise<Restaurant> {
    return this.restaurantService.findById(restaurantId);
  }

  @Put(':id')
  async updateRestaurant(
    @Param('id')
    restaurantId: string,
    @Body()
    restaurant: UpdateRestaurantDTO,
  ): Promise<Restaurant> {
    await this.restaurantService.findById(restaurantId);

    return this.restaurantService.updateById(restaurantId, restaurant);
  }

  @Delete(':id')
  async deleteRestaurant(
    @Param('id') restaurantId: string,
  ): Promise<{ deleted: boolean }> {
    return await this.restaurantService.deleteById(restaurantId);
  }

  @Put('upload/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(
    @Param('id') restaurantId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.restaurantService.uploadImages(restaurantId, files);
  }
}

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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './schema/restaurant.schema';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RouteRolesGuard } from 'src/auth/guards/route-roles.guard';
import { AllowedRoles } from 'src/common/decorators/allowed-roles.decorator';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  async getRestaurants(@Query() query: ExpressQuery): Promise<Restaurant[]> {
    return this.restaurantService.findAll(query);
  }

  @Post()
  @UseGuards(RouteRolesGuard)
  @AllowedRoles('ADMIN')
  async createRestaurant(
    @Body()
    restaurant: CreateRestaurantDTO,
    @CurrentUserId() userId: string,
  ): Promise<Restaurant> {
    return this.restaurantService.create(restaurant, userId);
  }

  @Get(':id')
  async getRestaurant(
    @Param('id')
    restaurantId: string,
  ): Promise<Restaurant> {
    return this.restaurantService.findById(restaurantId);
  }

  @Put(':id')
  @UseGuards(RouteRolesGuard)
  @AllowedRoles('ADMIN')
  async updateRestaurant(
    @Param('id')
    restaurantId: string,
    @Body()
    restaurant: UpdateRestaurantDTO,
    @CurrentUserId() userId: string,
  ): Promise<Restaurant> {
    await this.restaurantService.findById(restaurantId);

    return this.restaurantService.updateById(restaurantId, restaurant, userId);
  }

  @Delete(':id')
  async deleteRestaurant(
    @Param('id') restaurantId: string,
    @CurrentUserId() userId: string,
  ): Promise<{ deleted: boolean }> {
    return await this.restaurantService.deleteById(restaurantId, userId);
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

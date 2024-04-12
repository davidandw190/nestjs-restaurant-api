import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './schema/restaurant.schema';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  async getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantService.findAll();
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
}

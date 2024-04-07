import { Body, Controller, Get, Post } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './schema/restaurant.schema';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';

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
}

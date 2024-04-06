import { Controller, Get } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './schema/restaurant.schema';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  async getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantService.findAll();
  }
}

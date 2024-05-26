import { Controller, Get, Query } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Meal } from './schema/meal.schema';
import { MealsService } from './meals.service';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  async getMeals(@Query() query: ExpressQuery): Promise<Meal[]> {
    return this.mealsService.findAll(query);
  }
}

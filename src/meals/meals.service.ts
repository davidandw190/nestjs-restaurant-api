import { Injectable } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Meal } from './schema/meal.schema';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from 'src/restaurant/schema/restaurant.schema';

@Injectable()
export class MealsService {
  constructor(
    @InjectModel(Meal.name)
    private readonly mealModel: mongoose.Model<Meal>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: mongoose.Model<Restaurant>,
  ) {}

  async findAll(query: ExpressQuery): Promise<Meal[]> {
    const resultsPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resultsPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          name: {
            $regex: new RegExp(query.keyword.toString(), 'i'),
          },
        }
      : {};
    return await this.mealModel
      .find({ ...keyword })
      .limit(resultsPerPage)
      .skip(skip)
      .exec();
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Restaurant } from './schema/restaurant.schema';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { Query } from 'express-serve-static-core';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: mongoose.Model<Restaurant>,
  ) {}

  async findAll(query: Query): Promise<Restaurant[]> {
    const resPerPage = 2;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          name: {
            $regex: new RegExp(query.keyword.toString(), 'i'),
          },
        }
      : {};

    return await this.restaurantModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }

  async create(restaurant: CreateRestaurantDTO): Promise<Restaurant> {
    const createdRestaurant = new this.restaurantModel(restaurant);
    return createdRestaurant.save();
  }

  async findById(restaurantId: string): Promise<Restaurant> {
    const isValidId = mongoose.isValidObjectId(restaurantId);

    if (!isValidId) {
      throw new BadRequestException(
        'Invalid ID format. Please provide a valid ID.',
      );
    }

    const restaurant = await this.restaurantModel.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    return restaurant;
  }

  async updateById(
    restaurantId: string,
    restaurant: UpdateRestaurantDTO,
  ): Promise<Restaurant> {
    const isValidId = mongoose.isValidObjectId(restaurantId);

    if (!isValidId) {
      throw new BadRequestException(
        'Invalid ID format. Please provide a valid ID.',
      );
    }

    const updatedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(restaurantId, restaurant, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedRestaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    return updatedRestaurant;
  }

  async deleteById(restaurantId: string): Promise<{ deleted: boolean }> {
    const { deletedCount } = await this.restaurantModel
      .deleteOne({ _id: restaurantId })
      .exec();

    return { deleted: deletedCount === 1 };
  }
}

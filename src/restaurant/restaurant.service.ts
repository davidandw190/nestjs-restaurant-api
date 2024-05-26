import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Restaurant } from './schema/restaurant.schema';
import { CreateRestaurantDTO } from './dto/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dto/update-restaurant.dto';
import { Query } from 'express-serve-static-core';
import LocationUtils from './utils/location.utils';
import ImagesUtils from './utils/images.utils';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: mongoose.Model<Restaurant>,
  ) {}

  async findAll(query: Query): Promise<Restaurant[]> {
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

    return await this.restaurantModel
      .find({ ...keyword })
      .limit(resultsPerPage)
      .skip(skip)
      .exec();
  }

  async create(
    restaurant: CreateRestaurantDTO,
    userId: string,
  ): Promise<Restaurant> {
    const geoLocation = await LocationUtils.getRestaurantGeoLocation(
      restaurant.address,
    );

    const data = Object.assign(restaurant, {
      owner: userId,
      location: geoLocation,
    });

    const createdRestaurant = new this.restaurantModel(data);

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
    userId: string,
  ): Promise<Restaurant> {
    const isValidId = mongoose.isValidObjectId(restaurantId);

    if (!isValidId) {
      throw new BadRequestException(
        'Invalid ID format. Please provide a valid ID.',
      );
    }

    const existingRestaurant =
      await this.restaurantModel.findById(restaurantId);

    this.checkRestaurantOwnership(existingRestaurant, userId);

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

  async deleteById(
    restaurantId: string,
    userId: string,
  ): Promise<{ deleted: boolean }> {
    const isValidId = mongoose.isValidObjectId(restaurantId);

    if (!isValidId) {
      throw new BadRequestException(
        'Invalid ID format. Please provide a valid ID.',
      );
    }

    const deletedRestaurant = await this.restaurantModel.findById(restaurantId);

    if (!deletedRestaurant) {
      throw new NotFoundException('Restaurant not found by given ID');
    }

    this.checkRestaurantOwnership(deletedRestaurant, userId);

    const isImagesDeleted = await this.deleteImages(deletedRestaurant.images);

    if (!isImagesDeleted) return { deleted: false };

    const { deletedCount } = await this.restaurantModel
      .deleteOne({ _id: restaurantId })
      .exec();

    return { deleted: deletedCount === 1 };
  }

  /**
   * Uploads images for a restaurant to AWS S3 and updates the restaurant with the uploaded images.
   * @param {string} restaurantId - The ID of the restaurant.
   * @param {Express.Multer.File[]} uploadedFiles - An array of image files to be uploaded.
   * @returns {Promise<Restaurant>} A promise that resolves to the updated restaurant object.
   */
  async uploadImages(
    restaurantId: string,
    uploadedFiles: Express.Multer.File[],
  ): Promise<Restaurant> {
    const exists = await this.restaurantModel.findById(restaurantId);

    if (!exists) {
      throw new Error(`Restaurant with ID ${restaurantId} not found.`);
    }

    const images = await ImagesUtils.upload(uploadedFiles);

    const restaurant = await this.restaurantModel.findByIdAndUpdate(
      restaurantId,
      { images },
      { new: true, runValidators: true },
    );

    return restaurant;
  }

  private async deleteImages(deletedImages) {
    if (deletedImages.length === 0) return true;
    return await ImagesUtils.delete(deletedImages);
  }

  private checkRestaurantOwnership(
    restaurant: Restaurant,
    userId: string,
  ): void {
    const isOwner = restaurant.owner.toString() === userId;
    if (!isOwner) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action.',
      );
    }
  }
}

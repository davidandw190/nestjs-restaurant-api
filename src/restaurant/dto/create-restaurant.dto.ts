import {
  IsEmail,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

import { RestaurantCategory } from '../enums/restaurant-category.enum';
import { User } from 'src/auth/user/schema/user.schema';

/**
 * Data Transfer Object (DTO) for creating a restaurant.
 * Used for validating incoming data when creating a new restaurant.
 */
export class CreateRestaurantDTO {
  @IsNotEmpty({ message: 'Restaurant name field is required' })
  @IsString()
  readonly name: string;

  @IsNotEmpty({ message: 'Description field is required' })
  @IsString()
  readonly description: string;

  @IsNotEmpty({ message: 'Email filed is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  readonly email: string;

  @IsNotEmpty({ message: 'Phone number field is required' })
  @Matches(/^\+?(?:\d\s?){10,14}\d$/, {
    message: 'Invalid phone number format',
  })
  readonly phoneNo: string;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  readonly address: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum(RestaurantCategory, { message: 'Invalid category' })
  readonly category: RestaurantCategory;

  @IsEmpty({ message: 'You cannot provide the user ID.' })
  readonly owner: User;
}

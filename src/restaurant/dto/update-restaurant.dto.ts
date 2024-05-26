import {
  IsEmail,
  IsEmpty,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { RestaurantCategory } from '../enums/restaurant-category.enum';
import { User } from 'src/auth/user/schema/user.schema';

export class UpdateRestaurantDTO {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  readonly email: string;

  @IsOptional()
  @Matches(/^\+?(?:\d\s?){10,14}\d$/, {
    message: 'Invalid phone number format',
  })
  readonly phoneNo: number;

  @IsOptional()
  @IsString()
  readonly address: string;

  @IsOptional()
  @IsEnum(RestaurantCategory, { message: 'Invalid category' })
  readonly category: RestaurantCategory;

  @IsEmpty({ message: 'You cannot provide the user ID.' })
  readonly owner: User;
}

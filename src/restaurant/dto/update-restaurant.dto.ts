import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  Matches,
} from 'class-validator';
import { Category } from '../enums/category.enum';

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
  @IsEnum(Category, { message: 'Invalid category' })
  readonly category: Category;
}

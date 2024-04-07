import { Category } from '../enums/category.enum';

export class CreateRestaurantDTO {
  readonly name: string;
  readonly description: string;
  readonly email: string;
  readonly phoneNo: number;
  readonly address: string;
  readonly category: Category;
}

import { Schema, Prop, SchemaFactory } from '@nestjs/mogoose';
import { Category } from '../enums/category.enum';

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({})
  name: string;

  @Prop()
  description: string;

  @Prop()
  email: string;

  @Prop()
  phoneNo: number;

  @Prop()
  address: string;

  @Prop()
  category: Category;

  @Prop()
  images?: object[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

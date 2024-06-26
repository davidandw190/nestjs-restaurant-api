import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Location } from './location.schema';
import { RestaurantCategory } from '../enums/restaurant-category.enum';
import { User } from 'src/auth/user/schema/user.schema';
import mongoose from 'mongoose';

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
  category: RestaurantCategory;

  @Prop()
  images?: object[];

  @Prop({ type: Object, ref: 'Location' })
  location?: Location;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

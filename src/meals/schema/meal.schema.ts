import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Category } from 'src/restaurant/enums/category.enum';
import { User } from 'src/auth/user/schema/user.schema';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Meal {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  category: Category;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Retaurant' })
  restaurant: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const MealSchema = SchemaFactory.createForClass(Meal);

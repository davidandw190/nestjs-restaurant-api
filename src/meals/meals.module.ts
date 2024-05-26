import { AuthModule } from 'src/auth/auth.module';
import { MealSchema } from './schema/meal.schema';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantModule } from 'src/restaurant/restaurant.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Meal', schema: MealSchema }]),
    RestaurantModule,
  ],
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule {}

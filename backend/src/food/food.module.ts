import { Module } from '@nestjs/common';
import { FoodResolver } from './food.resolver';

@Module({
  providers: [FoodResolver],
})
export class FoodModule {}

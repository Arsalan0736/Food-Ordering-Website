import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() role: string;
  @Field({ nullable: true }) country?: string;
}

@ObjectType()
export class MenuItem {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field(() => Float) price: number;
}

@ObjectType()
export class Restaurant {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() country: string;
  @Field(() => [MenuItem]) menuItems: MenuItem[];
}

@ObjectType()
export class OrderItem {
  @Field(() => ID) id: string;
  @Field() menuItemId: string;
  @Field(() => Int) quantity: number;
  @Field(() => MenuItem) menuItem: MenuItem;
}

@ObjectType()
export class Order {
  @Field(() => ID) id: string;
  @Field() userId: string;
  @Field() status: string;
  @Field(() => Float) totalAmount: number;
  @Field(() => [OrderItem]) orderItems: OrderItem[];
}

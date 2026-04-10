import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Restaurant, Order, User } from './models';

@Resolver()
@UseGuards(RolesGuard)
export class FoodResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [User])
  async users() {
    return this.prisma.user.findMany();
  }

  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @Query(() => [Restaurant])
  async restaurants(@CurrentUser() userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    // Re-BAC Logic
    let countryFilter = {};
    if (user.role !== 'ADMIN') {
      countryFilter = { country: user.country }; // Managers & Members limited to their country
    }

    return this.prisma.restaurant.findMany({
      where: countryFilter,
      include: { menuItems: true },
    });
  }

  @Roles('ADMIN', 'MANAGER')
  @Mutation(() => Order)
  async placeOrder(
    @CurrentUser() userId: string,
    @Args('menuItemIds', { type: () => [String] }) menuItemIds: string[]
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Validate Re-BAC: user can only order from their country
    // Let's fetch all menu items
    const items = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      include: { restaurant: true }
    });

    if (user.role !== 'ADMIN') {
      const foreignItem = items.find(i => i.restaurant.country !== user.country);
      if (foreignItem) {
        throw new ForbiddenException('Cannot order items from another country');
      }
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    // Place the order
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: 'COMPLETED', // Directly completed for simulation
        totalAmount,
        orderItems: {
          create: items.map(i => ({ menuItemId: i.id, quantity: 1 }))
        }
      },
      include: { orderItems: { include: { menuItem: true } } }
    });

    return order;
  }

  @Roles('ADMIN', 'MANAGER')
  @Mutation(() => Order)
  async cancelOrder(
    @CurrentUser() userId: string,
    @Args('orderId', { type: () => ID }) orderId: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    const orderToCancel = await this.prisma.order.findUnique({ 
      where: { id: orderId },
      include: { user: true }
    });

    if (!orderToCancel) throw new Error('Order not found');

    if (user.role !== 'ADMIN' && orderToCancel.user.country !== user.country) {
      throw new ForbiddenException('Cannot cancel order from another country');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: { orderItems: { include: { menuItem: true } } }
    });
  }

  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @Query(() => [Order])
  async orders(@CurrentUser() userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    let filter = {};
    if (user.role === 'MEMBER') {
       filter = { userId }; // Members only see their own orders
    } else if (user.role === 'MANAGER') {
       filter = { user: { country: user.country } }; // Managers see orders for their country
    } // Admins see all

    return this.prisma.order.findMany({
      where: filter,
      include: { orderItems: { include: { menuItem: true } } }
    });
  }
}

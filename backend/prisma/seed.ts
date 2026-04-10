import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding...');

  const usersData = [
    { id: '1', name: 'Nick Fury', role: 'ADMIN' },
    { id: '2', name: 'Captain Marvel', role: 'MANAGER', country: 'INDIA' },
    { id: '3', name: 'Captain America', role: 'MANAGER', country: 'AMERICA' },
    { id: '4', name: 'Thanos', role: 'MEMBER', country: 'INDIA' },
    { id: '5', name: 'Thor', role: 'MEMBER', country: 'INDIA' },
    { id: '6', name: 'Travis', role: 'MEMBER', country: 'AMERICA' },
  ];

  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }

  await prisma.paymentMethod.create({ data: { type: 'CARD', details: '**** **** **** 1234', userId: '1' } });
  await prisma.paymentMethod.create({ data: { type: 'UPI', details: 'nick@upi', userId: '1' } });
  await prisma.paymentMethod.create({ data: { type: 'CARD', details: '**** **** **** 5678', userId: '2' } });

  const r1 = await prisma.restaurant.create({ data: { name: 'Delhi Durbar', country: 'INDIA' } });
  const r2 = await prisma.restaurant.create({ data: { name: 'Mumbai Spice', country: 'INDIA' } });
  const r3 = await prisma.restaurant.create({ data: { name: 'Texas BBQ', country: 'AMERICA' } });
  const r4 = await prisma.restaurant.create({ data: { name: 'NY Pizza', country: 'AMERICA' } });

  const m1 = await prisma.menuItem.create({ data: { name: 'Butter Chicken', price: 12.5, restaurantId: r1.id } });
  const m2 = await prisma.menuItem.create({ data: { name: 'Naan', price: 2.0, restaurantId: r1.id } });
  await prisma.menuItem.create({ data: { name: 'Vada Pav', price: 3.5, restaurantId: r2.id } });
  await prisma.menuItem.create({ data: { name: 'Cheese Pizza', price: 15.0, restaurantId: r4.id } });

  const order1 = await prisma.order.create({
    data: {
      userId: '4', 
      status: 'PENDING',
      totalAmount: 14.5, 
    }
  });

  await prisma.orderItem.create({
    data: { orderId: order1.id, menuItemId: m1.id, quantity: 1 }
  });
  await prisma.orderItem.create({
    data: { orderId: order1.id, menuItemId: m2.id, quantity: 1 }
  });

  console.log('Seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

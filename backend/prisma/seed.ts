import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      username: 'john_doe',
      password: hashedPassword,
      name: 'John Doe',
      role: 'user',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      username: 'jane_doe',
      password: hashedPassword,
      name: 'Jane Doe',
      role: 'user',
    },
  });

  // Create sample tasks for user1
  await prisma.task.createMany({
    data: [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive README and API documentation',
        priority: 'high',
        status: 'inprogress',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        tags: ['documentation', 'project'],
        orderIndex: 0,
        isCompleted: false,
        ownerId: user1.id,
      },
      {
        title: 'Review pull requests',
        description: 'Check and review team pull requests',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        tags: ['code-review'],
        orderIndex: 1,
        isCompleted: false,
        ownerId: user1.id,
      },
      {
        title: 'Schedule team meeting',
        description: 'Organize weekly team sync meeting',
        priority: 'low',
        status: 'done',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        tags: ['meeting', 'team'],
        orderIndex: 2,
        isCompleted: true,
        ownerId: user1.id,
      },
      {
        title: 'Update dependencies',
        description: 'Update npm packages to latest versions',
        priority: 'medium',
        status: 'todo',
        tags: ['maintenance'],
        orderIndex: 3,
        isCompleted: false,
        ownerId: user1.id,
      },
    ],
    skipDuplicates: true,
  });

  // Create sample tasks for user2
  await prisma.task.createMany({
    data: [
      {
        title: 'Design new feature',
        description: 'Create mockups for new dashboard feature',
        priority: 'high',
        status: 'todo',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ['design', 'feature'],
        orderIndex: 0,
        isCompleted: false,
        ownerId: user2.id,
      },
      {
        title: 'Write unit tests',
        description: 'Add unit tests for new components',
        priority: 'medium',
        status: 'inprogress',
        tags: ['testing'],
        orderIndex: 1,
        isCompleted: false,
        ownerId: user2.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeding completed successfully!');
  console.log('\n📝 Test accounts created:');
  console.log('  User 1: john@example.com / password123');
  console.log('  User 2: jane@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import User from '../models/User.model';
import Task from '../models/Task.model';
import { connectDatabase } from '../config/database';

dotenv.config();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Connect to database
  await connectDatabase();

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    await Task.deleteMany({});
    await User.deleteMany({});

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      email: 'john@example.com',
      username: 'john_doe',
      password: hashedPassword,
      name: 'John Doe',
      role: 'user',
    });

    const user2 = await User.create({
      email: 'jane@example.com',
      username: 'jane_doe',
      password: hashedPassword,
      name: 'Jane Doe',
      role: 'user',
    });

    // Create sample tasks for user1
    await Task.insertMany([
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive README and API documentation',
        priority: 'high',
        status: 'inprogress',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        tags: ['documentation', 'project'],
        orderIndex: 0,
        isCompleted: false,
        ownerId: user1._id,
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
        ownerId: user1._id,
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
        ownerId: user1._id,
      },
      {
        title: 'Update dependencies',
        description: 'Update npm packages to latest versions',
        priority: 'medium',
        status: 'todo',
        tags: ['maintenance'],
        orderIndex: 3,
        isCompleted: false,
        ownerId: user1._id,
      },
    ]);

    // Create sample tasks for user2
    await Task.insertMany([
      {
        title: 'Design new feature',
        description: 'Create mockups for new dashboard feature',
        priority: 'high',
        status: 'todo',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ['design', 'feature'],
        orderIndex: 0,
        isCompleted: false,
        ownerId: user2._id,
      },
      {
        title: 'Write unit tests',
        description: 'Add unit tests for new components',
        priority: 'medium',
        status: 'inprogress',
        tags: ['testing'],
        orderIndex: 1,
        isCompleted: false,
        ownerId: user2._id,
      },
    ]);

    console.log('✅ Seeding completed successfully!');
    console.log('\n📝 Test accounts created:');
    console.log('  User 1: john@example.com / password123');
    console.log('  User 2: jane@example.com / password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});


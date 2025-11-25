"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=seed.js.map
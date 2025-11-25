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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt = __importStar(require("bcryptjs"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Task_model_1 = __importDefault(require("../models/Task.model"));
const database_1 = require("../config/database");
dotenv_1.default.config();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Connect to database
    await (0, database_1.connectDatabase)();
    try {
        // Clear existing data (optional - comment out if you want to keep existing data)
        await Task_model_1.default.deleteMany({});
        await User_model_1.default.deleteMany({});
        // Create test users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user1 = await User_model_1.default.create({
            email: 'john@example.com',
            username: 'john_doe',
            password: hashedPassword,
            name: 'John Doe',
            role: 'user',
        });
        const user2 = await User_model_1.default.create({
            email: 'jane@example.com',
            username: 'jane_doe',
            password: hashedPassword,
            name: 'Jane Doe',
            role: 'user',
        });
        // Create sample tasks for user1
        await Task_model_1.default.insertMany([
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
        await Task_model_1.default.insertMany([
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
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
    finally {
        await mongoose_1.default.connection.close();
        process.exit(0);
    }
}
main().catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map
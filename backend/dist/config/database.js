"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./env"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Connect to MongoDB using Mongoose
 */
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(env_1.default.database.url);
        logger_1.default.info('✅ MongoDB connected successfully');
    }
    catch (error) {
        logger_1.default.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
/**
 * Disconnect from MongoDB
 */
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        logger_1.default.info('MongoDB disconnected');
    }
    catch (error) {
        logger_1.default.error('MongoDB disconnect error:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
// Handle connection events
mongoose_1.default.connection.on('connected', () => {
    logger_1.default.info('Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (error) => {
    logger_1.default.error('Mongoose connection error:', error);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.default.warn('Mongoose disconnected from MongoDB');
});
// Graceful shutdown
process.on('SIGINT', async () => {
    await (0, exports.disconnectDatabase)();
    process.exit(0);
});
exports.default = mongoose_1.default;
//# sourceMappingURL=database.js.map
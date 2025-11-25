"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./config/env"));
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const database_1 = require("./config/database");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.default.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
// Make io available to routes via app.locals
app.locals.io = io;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.default.cors.origin,
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.default.rateLimit.windowMs,
    max: env_1.default.rateLimit.max,
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Data sanitization
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, xss_clean_1.default)());
// Request logging
app.use((req, _res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next();
});
// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
// Socket.IO connection handling
io.on('connection', (socket) => {
    logger_1.default.info(`Socket connected: ${socket.id}`);
    // Join user's room based on userId (after authentication)
    socket.on('join-user-room', (userId) => {
        socket.join(`user:${userId}`);
        logger_1.default.info(`Socket ${socket.id} joined room: user:${userId}`);
    });
    // Leave user's room
    socket.on('leave-user-room', (userId) => {
        socket.leave(`user:${userId}`);
        logger_1.default.info(`Socket ${socket.id} left room: user:${userId}`);
    });
    socket.on('disconnect', () => {
        logger_1.default.info(`Socket disconnected: ${socket.id}`);
    });
});
// Global error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
const PORT = env_1.default.port;
server.listen(PORT, async () => {
    logger_1.default.info(`🚀 Server running on port ${PORT}`);
    logger_1.default.info(`📡 Environment: ${env_1.default.env}`);
    logger_1.default.info(`🔗 CORS enabled for: ${env_1.default.cors.origin.join(', ')}`);
    // Connect to database
    await (0, database_1.connectDatabase)();
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
    });
    await mongoose_1.default.connection.close();
    process.exit(0);
});
//# sourceMappingURL=server.js.map
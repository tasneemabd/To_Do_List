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
exports.loginUser = exports.registerUser = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const User_model_1 = __importDefault(require("../models/User.model"));
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const http_status_codes_1 = require("http-status-codes");
/**
 * Register a new user
 */
const registerUser = async (input) => {
    const { email, username, password, name } = input;
    // Check if user already exists
    const existingUser = await User_model_1.default.findOne({
        $or: [{ email }, { username }],
    });
    if (existingUser) {
        throw new errorHandler_1.AppError('User with this email or username already exists', http_status_codes_1.StatusCodes.CONFLICT);
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = await User_model_1.default.create({
        email,
        username,
        password: hashedPassword,
        name: name || username,
        role: 'user',
    });
    // Generate token
    const token = (0, jwt_1.generateToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
        },
        token,
    };
};
exports.registerUser = registerUser;
/**
 * Login user
 */
const loginUser = async (input) => {
    const { email, password } = input;
    // Find user with password field
    const user = await User_model_1.default.findOne({ email }).select('+password');
    if (!user) {
        throw new errorHandler_1.AppError('Invalid email or password', http_status_codes_1.StatusCodes.UNAUTHORIZED);
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new errorHandler_1.AppError('Invalid email or password', http_status_codes_1.StatusCodes.UNAUTHORIZED);
    }
    // Generate token
    const token = (0, jwt_1.generateToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
        },
        token,
    };
};
exports.loginUser = loginUser;
//# sourceMappingURL=auth.service.js.map
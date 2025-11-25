import * as bcrypt from 'bcryptjs';
import User from '../models/User.model';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { StatusCodes } from 'http-status-codes';

interface RegisterInput {
  email: string;
  username: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export const registerUser = async (input: RegisterInput) => {
  const { email, username, password, name } = input;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new AppError('User with this email or username already exists', StatusCodes.CONFLICT);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    email,
    username,
    password: hashedPassword,
    name: name || username,
    role: 'user',
  });

  // Generate token
  const token = generateToken({
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

/**
 * Login user
 */
export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  // Generate token
  const token = generateToken({
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

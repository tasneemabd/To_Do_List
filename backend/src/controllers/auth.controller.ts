import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as authService from '../services/auth.service';
import logger from '../utils/logger';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, username, password, name } = req.body;

    const result = await authService.registerUser({
      email,
      username,
      password,
      name,
    });

    logger.info(`New user registered: ${email}`);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({
      email,
      password,
    });

    logger.info(`User logged in: ${email}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


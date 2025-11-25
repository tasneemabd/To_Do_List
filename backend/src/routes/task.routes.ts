import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksSchema,
  taskIdSchema,
  updateOrderSchema,
} from '../validators/task.validator';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', validate(getTasksSchema), taskController.getTasks);
router.get('/statistics', taskController.getTaskStatistics);
router.get('/:id', validate(taskIdSchema), taskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', validate(taskIdSchema), taskController.deleteTask);
router.patch('/order', validate(updateOrderSchema), taskController.updateTaskOrder);

export default router;


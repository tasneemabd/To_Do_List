import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTaskModal } from '../hooks/useTaskModal';
import { createTask, updateTask } from '../services/task.service';
import { useToast } from './Toast';
import Button from './Button';
import Input from './Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'inprogress', 'done']).default('todo'),
  dueDate: z.string().optional().nullable(),
  tags: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  onSuccess: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ onSuccess }) => {
  const { isOpen, editingTask, closeModal } = useTaskModal();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      status: 'todo',
    },
  });

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split('T')[0]
          : '',
        tags: editingTask.tags.join(', '),
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        tags: '',
      });
    }
  }, [editingTask, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    try {
      const tags = data.tags ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
      const taskData = {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        tags,
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        showToast('Task updated successfully!', 'success');
      } else {
        await createTask(taskData);
        showToast('Task created successfully!', 'success');
      }
      closeModal();
      onSuccess();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save task', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{editingTask ? 'Edit Task' : 'Create Task'}</CardTitle>
          <CardDescription>
            {editingTask ? 'Update task details' : 'Add a new task to your list'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter task title"
              error={errors.title?.message}
              {...register('title')}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter task description"
                {...register('description')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('status')}
                >
                  <option value="todo">Todo</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <Input
              label="Due Date"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />
            <Input
              label="Tags (comma-separated)"
              placeholder="work, urgent, personal"
              error={errors.tags?.message}
              {...register('tags')}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={closeModal} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {editingTask ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskModal;


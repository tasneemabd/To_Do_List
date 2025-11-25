import React, { useState } from 'react';
import { Task } from '../types';
import { Card, CardContent, CardHeader } from './Card';
import Button from './Button';
import { useTaskModal } from '../hooks/useTaskModal';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
  const { openEditModal } = useTaskModal();
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    inprogress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow',
        task.isCompleted && 'opacity-60'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3
            className={cn(
              'text-lg font-semibold',
              task.isCompleted && 'line-through'
            )}
          >
            {task.title}
          </h3>
          <div className="flex gap-2">
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                priorityColors[task.priority]
              )}
            >
              {task.priority}
            </span>
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                statusColors[task.status]
              )}
            >
              {task.status}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
        )}
        {task.dueDate && (
          <p className="text-xs text-muted-foreground mb-3">
            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </p>
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComplete(task.id)}
            disabled={task.isCompleted}
          >
            {task.isCompleted ? 'Completed' : 'Complete'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => openEditModal(task)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;


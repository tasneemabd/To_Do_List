import React, { useState } from 'react';
import { Task } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskModal } from '../hooks/useTaskModal';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '../utils/cn';

interface TrelloTaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TrelloTaskCard: React.FC<TrelloTaskCardProps> = ({ task, onComplete, onDelete }) => {
  const { openEditModal } = useTaskModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.6 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  const priorityColors = {
    low: 'bg-gradient-to-r from-teal-400 to-cyan-500',
    medium: 'bg-gradient-to-r from-amber-400 to-orange-500',
    high: 'bg-gradient-to-r from-rose-500 to-pink-600',
  };

  const priorityGlow = {
    low: 'shadow-teal-500/30',
    medium: 'shadow-amber-500/30',
    high: 'shadow-rose-500/30',
  };

  const getDueDateColor = () => {
    if (!task.dueDate) return '';
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && !isToday(dueDate) && !task.isCompleted) {
      return 'text-red-600 font-semibold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded';
    }
    if (isToday(dueDate) && !task.isCompleted) {
      return 'text-orange-600 font-semibold bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded';
    }
    return 'text-muted-foreground';
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openEditModal(task)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative bg-white dark:bg-purple-900/30 rounded-xl p-4',
        'shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer',
        'border-2 border-purple-200 dark:border-purple-700',
        'backdrop-blur-sm bg-opacity-95',
        isDragging && 'shadow-2xl scale-105 rotate-1 z-50 border-pink-400',
        task.isCompleted && 'opacity-70 grayscale-[0.3]',
        'hover:border-pink-400 dark:hover:border-pink-500 hover:-translate-y-1',
        'transform-gpu'
      )}
    >
      {/* Priority Indicator with Gradient */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-1.5 rounded-t-xl',
        priorityColors[task.priority],
        'shadow-lg',
        priorityGlow[task.priority]
      )} />

      {/* Glow Effect on Hover */}
      {isHovered && !isDragging && (
        <div className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'bg-gradient-to-br from-primary/5 via-transparent to-transparent',
          'pointer-events-none'
        )} />
      )}

      {/* Task Content */}
      <div className="relative z-10">
        {/* Task Title */}
        <h3
          className={cn(
            'font-semibold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-gray-100',
            'group-hover:text-primary transition-colors duration-200',
            task.isCompleted && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md border border-violet-200 dark:border-violet-700 shadow-sm hover:shadow-md transition-shadow"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-muted-foreground bg-muted rounded-md">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
          {/* Due Date */}
          {task.dueDate && (
            <div className={cn('text-xs flex items-center gap-1.5 font-medium', getDueDateColor())}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200',
                'hover:bg-green-50 dark:hover:bg-green-900/20',
                'hover:scale-110 active:scale-95',
                task.isCompleted
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
              )}
              title={task.isCompleted ? 'Completed' : 'Mark as complete'}
            >
              {task.isCompleted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 active:scale-95 text-gray-400"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Shine Effect */}
      {isHovered && !isDragging && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
      )}
    </div>
  );
};

export default TrelloTaskCard;

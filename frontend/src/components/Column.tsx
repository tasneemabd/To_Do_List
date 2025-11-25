import React, { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../utils/cn';

interface ColumnProps {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
  className?: string;
  color?: string;
}

const Column: React.FC<ColumnProps> = ({ id, title, count, children, className }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const columnStyles = {
    todo: 'bg-gradient-to-br from-purple-100 via-violet-100 to-fuchsia-100 dark:from-purple-900/40 dark:via-violet-900/40 dark:to-fuchsia-900/40 border-purple-300 dark:border-purple-700',
    inprogress: 'bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 dark:from-pink-900/40 dark:via-rose-900/40 dark:to-red-900/40 border-pink-300 dark:border-pink-700',
    done: 'bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 dark:from-amber-900/40 dark:via-orange-900/40 dark:to-yellow-900/40 border-amber-300 dark:border-amber-700',
  };

  const titleColors = {
    todo: 'text-purple-700 dark:text-purple-300',
    inprogress: 'text-pink-700 dark:text-pink-300',
    done: 'text-amber-700 dark:text-amber-300',
  };

  const badgeColors = {
    todo: 'bg-gradient-to-r from-purple-400 to-violet-400 text-white dark:from-purple-600 dark:to-violet-600',
    inprogress: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white dark:from-pink-600 dark:to-rose-600',
    done: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white dark:from-amber-600 dark:to-orange-600',
  };

  const currentStyle = columnStyles[id as keyof typeof columnStyles] || columnStyles.todo;
  const currentTitleColor = titleColors[id as keyof typeof titleColors] || titleColors.todo;
  const currentBadgeColor = badgeColors[id as keyof typeof badgeColors] || badgeColors.todo;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full min-h-[600px] rounded-2xl p-5 transition-all duration-300',
        'border-2 backdrop-blur-sm',
        currentStyle,
        isOver && 'ring-4 ring-primary/50 ring-offset-2 scale-[1.02] shadow-2xl',
        'hover:shadow-xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-purple-200 dark:border-purple-700">
        <div className="flex items-center gap-2">
          <h2 className={cn('text-xl font-bold', currentTitleColor)}>
            {title}
          </h2>
        </div>
        <span className={cn(
          'flex items-center justify-center min-w-[32px] h-7 px-3 text-sm font-bold rounded-full shadow-sm',
          'transition-all duration-200 hover:scale-110',
          currentBadgeColor
        )}>
          {count}
        </span>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        {children}
      </div>

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="mt-3 p-3 border-2 border-dashed border-primary/50 rounded-xl bg-primary/5 animate-pulse">
          <p className="text-center text-xs text-primary font-medium">Drop task here</p>
        </div>
      )}
    </div>
  );
};

export default Column;

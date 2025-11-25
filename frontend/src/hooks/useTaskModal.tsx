import { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from '../types';

interface TaskModalContextType {
  isOpen: boolean;
  editingTask: Task | null;
  openCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeModal: () => void;
}

const TaskModalContext = createContext<TaskModalContextType | undefined>(undefined);

export const TaskModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openCreateModal = () => {
    setEditingTask(null);
    setIsOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingTask(null);
  };

  return (
    <TaskModalContext.Provider
      value={{
        isOpen,
        editingTask,
        openCreateModal,
        openEditModal,
        closeModal,
      }}
    >
      {children}
    </TaskModalContext.Provider>
  );
};

export const useTaskModal = () => {
  const context = useContext(TaskModalContext);
  if (!context) {
    throw new Error('useTaskModal must be used within TaskModalProvider');
  }
  return context;
};


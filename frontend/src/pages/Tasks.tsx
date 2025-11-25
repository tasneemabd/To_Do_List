import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getTasks, updateTask, deleteTask, updateTaskOrder } from '../services/task.service';
import { Task } from '../types';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import TrelloTaskCard from '../components/TrelloTaskCard';
import Column from '../components/Column';
import TaskModal from '../components/TaskModal';
import { TaskModalProvider, useTaskModal } from '../hooks/useTaskModal';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../config/socket';
import Spinner from '../components/Spinner';
import { Card, CardContent } from '../components/Card';
import { cn } from '../utils/cn';

const STATUSES = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-500', icon: '📋' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-blue-500', icon: '⚡' },
  { id: 'done', title: 'Done', color: 'bg-green-500', icon: '✅' },
] as const;

const TasksContent: React.FC = () => {
  const { token, user } = useAuth();
  const { openCreateModal } = useTaskModal();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'todo' | 'inprogress' | 'done'>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasks', { search }],
    queryFn: () => getTasks({ page: 1, limit: 100, sortBy: 'orderIndex', sortOrder: 'asc' }),
  });

  const allTasks = data?.data || [];

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!search) return allTasks;
    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [allTasks, search]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      todo: [],
      inprogress: [],
      done: [],
    };

    filteredTasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    // Sort by orderIndex within each status
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return grouped;
  }, [filteredTasks]);

  // Socket.io connection and event listeners
  useEffect(() => {
    if (!token || !user) return;

    const socket = getSocket(token);
    socket.emit('join-user-room', user.id);

    socket.on('task:created', (task: Task) => {
      queryClient.setQueryData(['tasks', { search }], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [...old.data, task],
        };
      });
      showToast('New task created', 'success');
    });

    socket.on('task:updated', (task: Task) => {
      queryClient.setQueryData(['tasks', { search }], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((t: Task) => (t.id === task.id ? task : t)),
        };
      });
    });

    socket.on('task:deleted', ({ id }: { id: string }) => {
      queryClient.setQueryData(['tasks', { search }], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((t: Task) => t.id !== id),
        };
      });
      showToast('Task deleted', 'info');
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.emit('leave-user-room', user.id);
    };
  }, [token, user, queryClient, search, showToast]);

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] });
      showToast('Task deleted successfully', 'success');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete task', 'error');
    },
  });

  const handleComplete = async (id: string) => {
    const task = allTasks.find((t) => t.id === id);
    if (!task) return;

    await updateTaskMutation.mutateAsync({
      id,
      data: {
        isCompleted: !task.isCompleted,
        status: !task.isCompleted ? 'done' : 'todo',
      },
    });
  };

  const handleDelete = async (id: string) => {
    await deleteTaskMutation.mutateAsync(id);
  };

  const handleDragStart = (_event: DragStartEvent) => {
    // Visual feedback during drag start
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback during drag
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Get the target status (column)
    let targetStatus: 'todo' | 'inprogress' | 'done' = task.status;

    // Check if dropped on a column
    if (over.id === 'todo' || over.id === 'inprogress' || over.id === 'done') {
      targetStatus = over.id as 'todo' | 'inprogress' | 'done';
    } else {
      // Check if dropped on another task
      const targetTask = allTasks.find((t) => t.id === over.id);
      if (targetTask) {
        targetStatus = targetTask.status;
      }
    }

    // If status changed, update it
    if (targetStatus !== task.status) {
      try {
        await updateTaskMutation.mutateAsync({
          id: taskId,
          data: { status: targetStatus },
        });
        showToast(`Task moved to ${STATUSES.find((s) => s.id === targetStatus)?.title}`, 'success');
      } catch (error: any) {
        showToast('Failed to move task', 'error');
      }
      return;
    }

    // If same column, reorder tasks
    const sourceTasks = tasksByStatus[targetStatus];
    const sourceIndex = sourceTasks.findIndex((t) => t.id === taskId);
    const targetIndex = sourceTasks.findIndex((t) => t.id === over.id);

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
      return;
    }

    // Reorder tasks in the same column
    const reorderedTasks = [...sourceTasks];
    const [removed] = reorderedTasks.splice(sourceIndex, 1);
    reorderedTasks.splice(targetIndex, 0, removed);

    // Update orderIndex for all tasks in the column
    const updatedOrder = reorderedTasks.map((t, index) => ({
      id: t.id,
      orderIndex: index,
    }));

    try {
      await updateTaskOrder(updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error: any) {
      showToast('Failed to reorder tasks', 'error');
      refetch();
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 min-h-screen">
      {/* Header with Vibrant Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
              📋 Tasks Board
            </h1>
            <p className="text-pink-100 text-lg font-medium">Manage your tasks in a vibrant Kanban board</p>
          </div>
          <Button 
            onClick={openCreateModal}
            className="bg-white text-fuchsia-600 hover:bg-pink-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold px-6 py-6 text-lg rounded-xl"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </Button>
        </div>
      </div>

      {/* Search and Filters with Modern Design */}
      <Card className="border-0 shadow-xl bg-white/90 dark:bg-purple-900/30 backdrop-blur-sm border-purple-200 dark:border-purple-700">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                placeholder="🔍 Search tasks by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 pl-10 h-12 rounded-xl border-2 focus:border-primary shadow-sm focus:shadow-md transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'rounded-lg font-medium transition-all duration-200 hover:scale-105',
                  activeFilter === 'all' && 'shadow-lg'
                )}
              >
                All ({filteredTasks.length})
              </Button>
              <Button
                variant={activeFilter === 'todo' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('todo')}
                className={cn(
                  'rounded-lg font-medium transition-all duration-200 hover:scale-105',
                  activeFilter === 'todo' && 'shadow-lg bg-gradient-to-r from-purple-600 to-violet-600 border-purple-600 text-white'
                )}
              >
                To Do ({tasksByStatus.todo.length})
              </Button>
              <Button
                variant={activeFilter === 'inprogress' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('inprogress')}
                className={cn(
                  'rounded-lg font-medium transition-all duration-200 hover:scale-105',
                  activeFilter === 'inprogress' && 'shadow-lg bg-gradient-to-r from-pink-500 to-rose-500 border-pink-500 text-white'
                )}
              >
                In Progress ({tasksByStatus.inprogress.length})
              </Button>
              <Button
                variant={activeFilter === 'done' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('done')}
                className={cn(
                  'rounded-lg font-medium transition-all duration-200 hover:scale-105',
                  activeFilter === 'done' && 'shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500 text-white'
                )}
              >
                Done ({tasksByStatus.done.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4 px-1">
            {STATUSES.map((status) => {
              const tasks = activeFilter === 'all' || activeFilter === status.id
                ? tasksByStatus[status.id]
                : [];

              return (
                <Column
                  key={status.id}
                  id={status.id}
                  title={status.title}
                  count={tasksByStatus[status.id].length}
                  className="min-w-[320px] max-w-[380px]"
                  color={status.color}
                >
                  <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 opacity-50">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">No tasks yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Drag tasks here or create a new one</p>
                      </div>
                    ) : (
                      tasks.map((task, index) => (
                        <div
                          key={task.id}
                          style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                          }}
                        >
                          <TrelloTaskCard
                            task={task}
                            onComplete={handleComplete}
                            onDelete={handleDelete}
                          />
                        </div>
                      ))
                    )}
                  </SortableContext>
                </Column>
              );
            })}
          </div>
        </DndContext>
      )}

      <TaskModal onSuccess={() => refetch()} />
    </div>
  );
};

const Tasks: React.FC = () => {
  return (
    <Layout>
      <TaskModalProvider>
        <TasksContent />
      </TaskModalProvider>
    </Layout>
  );
};

export default Tasks;

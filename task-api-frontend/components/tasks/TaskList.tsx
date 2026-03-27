'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Task } from '@/types';
import TaskCard from './TaskCard';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import EditTaskModal from './EditTaskModal';
import { getTasks, deleteTask, updateTask } from '@/services/taskService';
import { useToast } from '@/context/ToastContext';

interface TaskListProps {
  refreshTrigger: number;
}

type FilterType = 'all' | 'pending' | 'completed';

export default function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const { addToast } = useToast();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { page, limit };
      if (filter === 'pending') params.completed = false;
      if (filter === 'completed') params.completed = true;
      if (search) params.search = search;

      const data = await getTasks(params);
      setTasks(data.data);
      setTotal(data.meta.total);
    } catch {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, filter, search, refreshTrigger]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setTotal((prev) => prev - 1);
      addToast('Task deleted', 'success');
    } catch {
      addToast('Failed to delete task', 'error');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleEdit = (task: Task) => setEditingTask(task);

  const handleSaveEdit = async (newTitle: string) => {
    if (!editingTask) return;
    try {
      const data = await updateTask(editingTask.id, { title: newTitle });
      if (data.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? { ...t, title: newTitle } : t))
        );
        addToast('Task updated', 'success');
      }
    } catch {
      addToast('Failed to update task', 'error');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const originalStatus = task.completed;
    const newStatus = !originalStatus;
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: newStatus } : t))
    );

    try {
      await updateTask(task.id, { completed: newStatus });
      addToast(newStatus ? 'Task completed' : 'Task pending', 'success');
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: originalStatus } : t))
      );
      addToast('Failed to update task status', 'error');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Filters */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10 shrink-0 self-start sm:self-auto overflow-x-auto">
          {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-all duration-150 whitespace-nowrap ${
                filter === f
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{total} task{total !== 1 ? 's' : ''} found</span>
        {total > limit && (
          <span>Page {page} of {totalPages}</span>
        )}
      </div>

      {/* Task List / Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="text-rose-400 text-sm">{error}</div>
          <Button variant="secondary" size="sm" onClick={fetchTasks}>Retry</Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No tasks yet</p>
          <p className="text-slate-600 text-sm max-w-xs">
            {search ? 'No tasks match your search.' : 'Create your first task using the form above.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-slate-400 border-b border-white/10 bg-white/5 uppercase font-medium">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">Done</th>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Created</th>
                  <th className="px-4 py-3 hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onToggleComplete={handleToggleComplete}
                    isDeleting={deletingIds.has(task.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </Button>
          <span className="text-slate-500 text-sm px-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          initialTitle={editingTask.title}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

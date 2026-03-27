'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import TaskList from '@/components/tasks/TaskList';
import { createTask } from '@/services/taskService';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';

export default function TasksPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!authLoading && !getToken()) {
      router.replace('/login');
    }
  }, [authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleCreate = async (title: string) => {
    await createTask(title);
    addToast('Task created!', 'success');
    setRefreshTrigger((n) => n + 1);
  };

  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <Header />

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/6 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your tasks</p>
        </div>

        {/* Create form */}
        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-slate-400 mb-3">New Task</h2>
          <CreateTaskForm onCreate={handleCreate} />
        </div>

        {/* Task list */}
        <TaskList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

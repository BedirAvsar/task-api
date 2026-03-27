'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import Button from '@/components/ui/Button';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  isDeleting?: boolean;
}

export default function TaskCard({ task, onDelete, onEdit, onToggleComplete, isDeleting }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <tr
      className={`group bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors duration-200 ${
        isDeleting ? 'opacity-50' : ''
      }`}
    >
      {/* Status (Checkbox) */}
      <td className="p-4 whitespace-nowrap">
        <button
          onClick={() => onToggleComplete(task)}
          className={`shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0f0f14] ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-500 hover:border-violet-400 focus:border-violet-500 text-transparent'
          }`}
          title={task.completed ? 'Mark as pending' : 'Mark as done'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </td>

      {/* Content */}
      <td className="p-4 min-w-[200px] w-full">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
          {task.title}
        </p>
      </td>

      {/* Date */}
      <td className="p-4 whitespace-nowrap hidden sm:table-cell">
        <p className="text-xs text-slate-400">{formatDate(task.created_at)}</p>
      </td>

      {/* Badge */}
      <td className="p-4 whitespace-nowrap hidden md:table-cell">
        <span
          className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${
            task.completed
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
          }`}
        >
          {task.completed ? 'Done' : 'Pending'}
        </span>
      </td>

      {/* Actions */}
      <td className="p-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!confirmDelete ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(task)} title="Edit task" className="h-8 w-8 !p-0 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} title="Delete task" className="h-8 w-8 !p-0 rounded-lg text-rose-400 hover:text-rose-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-rose-400 mr-1">Delete?</span>
              <Button
                variant="danger"
                size="sm"
                className="h-8 !py-0 !px-2.5 rounded-lg"
                isLoading={isDeleting}
                onClick={() => {
                  onDelete(task.id);
                  setConfirmDelete(false);
                }}
              >
                Yes
              </Button>
              <Button variant="secondary" size="sm" className="h-8 !py-0 !px-2.5 rounded-lg" onClick={() => setConfirmDelete(false)}>
                No
              </Button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

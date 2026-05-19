import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconCalendar, IconListCheck } from '@tabler/icons-react';
import api from '../lib/axios';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';

const STATUS_TABS = ['All', 'TODO', 'IN_PROGRESS', 'DONE'];

export default function MyTasks() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.get('/dashboard/my-tasks').then((r) => r.data.tasks),
  });

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }) => api.patch(`/tasks/${taskId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
  });

  const filtered = (tasks || []).filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const groupTasks = (list) => {
    const groups = { Today: [], 'This Week': [], Later: [], 'No Due Date': [] };
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

    list.forEach((t) => {
      if (!t.dueDate) { groups['No Due Date'].push(t); return; }
      const d = new Date(t.dueDate);
      if (d.toDateString() === now.toDateString()) { groups['Today'].push(t); return; }
      if (d <= endOfWeek) { groups['This Week'].push(t); return; }
      groups['Later'].push(t);
    });
    return groups;
  };

  const grouped = groupTasks(filtered);

  if (isLoading) return <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-slide-up">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#F1F5F9]" style={{ letterSpacing: '-0.3px' }}>My Tasks</h1>
        <p className="text-sm text-[#475569] mt-1">{tasks?.length || 0} tasks assigned to you</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="flex gap-1 bg-[#1A1D27] border border-[#2D3248] rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => setStatusFilter(tab)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === tab ? 'bg-[#6366F1] text-white' : 'text-[#475569] hover:text-[#94A3B8]'
              }`}>
              {tab === 'IN_PROGRESS' ? 'In Progress' : tab}
            </button>
          ))}
        </div>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-8 px-2.5 bg-[#1A1D27] border border-[#2D3248] rounded-lg text-xs text-[#94A3B8] focus:outline-none focus:border-[#6366F1]">
          <option value="">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {!filtered.length ? (
        <div className="text-center py-16">
          <IconListCheck size={40} className="mx-auto text-[#475569] mb-3" />
          <p className="text-sm text-[#475569]">No tasks match your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([groupName, groupTasks]) =>
            groupTasks.length > 0 && (
              <div key={groupName}>
                <h3 className="text-xs font-medium uppercase tracking-wider text-[#475569] mb-3">{groupName}</h3>
                <div className="bg-[#1A1D27] border border-[#2D3248] rounded-xl overflow-hidden">
                  {groupTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                    return (
                      <div key={task.id}
                        className={`flex items-center justify-between px-5 py-3.5 border-b border-[#2D3248] last:border-0 hover:bg-[#22263A] transition-colors ${
                          isOverdue ? 'border-l-[3px] border-l-[#EF4444]' : ''
                        } ${task.status === 'DONE' ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button onClick={() => {
                            if (task.status !== 'DONE') updateStatus.mutate({ taskId: task.id, status: 'DONE' });
                          }}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              task.status === 'DONE' ? 'bg-[#10B981] border-[#10B981]' : 'border-[#3D4266] hover:border-[#6366F1]'
                            }`}>
                            {task.status === 'DONE' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-[#475569]' : 'text-[#F1F5F9]'}`}>
                              {task.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-xs text-[#475569] flex items-center gap-1">
                            <IconCalendar size={12} />
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'No date'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#22263A] text-[#94A3B8]">
                            {task.project?.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

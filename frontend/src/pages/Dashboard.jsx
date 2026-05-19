import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { IconArrowUp, IconArrowDown, IconCheck, IconAlertTriangle, IconFolder, IconListCheck } from '@tabler/icons-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../lib/axios';
import { MetricSkeleton } from '../components/ui/Skeleton';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';

const COLORS = { TODO: '#94A3B8', IN_PROGRESS: '#818CF8', DONE: '#10B981' };
const PRIORITY_COLORS = { LOW: '#94A3B8', MEDIUM: '#F59E0B', HIGH: '#EF4444' };

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: summary, isLoading: sLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/dashboard/summary').then((r) => r.data.summary),
  });

  const { data: overdue } = useQuery({
    queryKey: ['overdue'],
    queryFn: () => api.get('/dashboard/overdue').then((r) => r.data.tasks),
  });

  const { data: myTasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.get('/dashboard/my-tasks').then((r) => r.data.tasks),
  });

  const markDone = useMutation({
    mutationFn: (taskId) => api.patch(`/tasks/${taskId}/status`, { status: 'DONE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['overdue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const metrics = [
    { label: 'Total Tasks', value: summary?.totalTasks ?? '-', icon: IconListCheck, color: '#818CF8', trend: '+12%' },
    { label: 'Completed This Week', value: summary?.completedThisWeek ?? '-', icon: IconCheck, color: '#10B981', trend: '+8%' },
    { label: 'Overdue', value: summary?.overdue ?? '-', icon: IconAlertTriangle, color: '#EF4444', trend: summary?.overdue > 0 ? '!' : '0' },
    { label: 'Active Projects', value: summary?.activeProjects ?? '-', icon: IconFolder, color: '#6366F1', trend: '' },
  ];

  const statusData = [
    { name: 'TODO', value: myTasks?.filter((t) => t.status === 'TODO').length || 0 },
    { name: 'IN PROGRESS', value: myTasks?.filter((t) => t.status === 'IN_PROGRESS').length || 0 },
    { name: 'DONE', value: myTasks?.filter((t) => t.status === 'DONE').length || 0 },
  ];

  const priorityData = [
    { name: 'LOW', value: myTasks?.filter((t) => t.priority === 'LOW').length || 0 },
    { name: 'MEDIUM', value: myTasks?.filter((t) => t.priority === 'MEDIUM').length || 0 },
    { name: 'HIGH', value: myTasks?.filter((t) => t.priority === 'HIGH').length || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
        ) : (
          metrics.map((m) => (
            <div key={m.label} className="bg-[#1A1D27] border border-[#2D3248] rounded-xl p-5 hover:border-[#3D4266] transition-all duration-150 group">
              <div className="flex items-start justify-between mb-3">
                <m.icon size={20} style={{ color: m.color }} />
                {m.trend && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${m.color === '#EF4444' ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                    {m.color === '#EF4444' ? <IconArrowDown size={12} /> : <IconArrowUp size={12} />}
                    {m.trend}
                  </span>
                )}
              </div>
              <div className="text-[28px] font-bold text-[#F1F5F9]" style={{ letterSpacing: '-0.5px' }}>{m.value}</div>
              <div className="text-xs font-medium uppercase tracking-wider text-[#475569] mt-1">{m.label}</div>
            </div>
          ))
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-[#1A1D27] border border-[#2D3248] rounded-xl p-5">
          <h3 className="text-sm font-medium text-[#F1F5F9] mb-4">Task Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A1D27', border: '1px solid #2D3248', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: '#F1F5F9' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name.replace(' ', '_')] || COLORS.TODO} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-[#1A1D27] border border-[#2D3248] rounded-xl p-5">
          <h3 className="text-sm font-medium text-[#F1F5F9] mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1A1D27', border: '1px solid #2D3248', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: '#F1F5F9' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {priorityData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-[#475569]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p.name] }} />
                {p.name} ({p.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue + My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1A1D27] border border-[#2D3248] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#F1F5F9]">Overdue Tasks</h3>
            {overdue?.length > 0 && <span className="text-xs text-[#EF4444] font-medium">{overdue.length} overdue</span>}
          </div>
          {!overdue?.length ? (
            <div className="text-center py-8">
              <IconCheck size={32} className="mx-auto text-[#10B981] mb-2" />
              <p className="text-sm text-[#475569]">No overdue tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdue.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2.5 border-b border-[#2D3248] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F1F5F9] truncate">{task.title}</p>
                    <p className="text-xs text-[#475569] mt-0.5">{task.assignee?.name || 'Unassigned'} · {task.project?.title}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-xs font-medium text-[#EF4444] bg-[#450A0A] px-2 py-0.5 rounded-full">
                      {task.daysOverdue}d overdue
                    </span>
                    <button onClick={() => markDone.mutate(task.id)} className="text-xs text-[#6366F1] hover:underline whitespace-nowrap">
                      Mark done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1A1D27] border border-[#2D3248] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#F1F5F9]">My Tasks</h3>
            <Link to="/my-tasks" className="text-xs text-[#6366F1] hover:underline">View all</Link>
          </div>
          {!myTasks?.length ? (
            <div className="text-center py-8">
              <IconListCheck size={32} className="mx-auto text-[#475569] mb-2" />
              <p className="text-sm text-[#475569]">No tasks assigned</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2.5 border-b border-[#2D3248] last:border-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <p className="text-sm text-[#F1F5F9] truncate">{task.title}</p>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <span className="text-xs text-[#475569] ml-3">{task.project?.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

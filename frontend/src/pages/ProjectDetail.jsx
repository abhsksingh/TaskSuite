import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  IconArrowLeft, IconPlus, IconCalendar, IconTrash, IconUserPlus,
  IconDotsVertical, IconX,
} from '@tabler/icons-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { StatusBadge, PriorityBadge, RoleBadge } from '../components/ui/Badge';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_ORDER = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };
const STATUS_COLORS = {
  TODO: { border: '#3D4266', dot: '#94A3B8', bg: '#22263A' },
  IN_PROGRESS: { border: '#3730A3', dot: '#818CF8', bg: '#1E293B' },
  DONE: { border: '#065F46', dot: '#10B981', bg: '#064E3B' },
};

const TABS = ['Board', 'Members'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'MEMBER' });
  const [error, setError] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data.project),
  });

  const isProjectAdmin = user?.role === 'ADMIN' || project?.members?.some(
    (m) => m.userId === user?.id && m.role === 'ADMIN'
  );

  const createTask = useMutation({
    mutationFn: (d) => api.post(`/projects/${id}/tasks`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); setShowTaskModal(false); setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' }); setError(''); },
    onError: (err) => setError(err.response?.data?.message || 'Failed'),
  });

  const addMember = useMutation({
    mutationFn: (d) => api.post(`/projects/${id}/members`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', id] }); setShowMemberModal(false); setMemberForm({ email: '', role: 'MEMBER' }); setError(''); },
    onError: (err) => setError(err.response?.data?.message || 'Failed'),
  });

  const removeMember = useMutation({
    mutationFn: (userId) => api.delete(`/projects/${id}/members/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }) => api.patch(`/tasks/${taskId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  });

  const deleteTask = useMutation({
    mutationFn: (taskId) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  });

  const deleteProject = useMutation({
    mutationFn: () => api.delete(`/projects/${id}`),
    onSuccess: () => window.location.href = '/projects',
    onError: (err) => setError(err.response?.data?.message || 'Failed'),
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    updateStatus.mutate({ taskId: draggableId, status: newStatus });
  };

  const canEditTask = (task) => user?.role === 'ADMIN' || isProjectAdmin || task.assigneeId === user?.id;

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!project) return <div className="text-center py-16 text-[#475569]">Project not found</div>;

  const tasksByStatus = (status) => {
    let tasks = project.tasks.filter((t) => t.status === status);
    if (filterPriority) tasks = tasks.filter((t) => t.priority === filterPriority);
    return tasks;
  };

  const isOverdue = (date) => date && new Date(date) < new Date() && tasksByStatus('DONE').length;

  return (
    <div className="animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-[#475569] hover:text-[#94A3B8] mb-2 transition-colors">
            <IconArrowLeft size={14} /> Back to Projects
          </Link>
          <h1 className="text-xl font-bold text-[#F1F5F9]" style={{ letterSpacing: '-0.3px' }}>{project.title}</h1>
          {project.description && <p className="text-sm text-[#475569] mt-1">{project.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-[#475569]">
            {project.deadline && (
              <span className="flex items-center gap-1">
                <IconCalendar size={12} />
                Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <span>{project.members?.length} members</span>
            <span>{project.tasks?.length} tasks</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isProjectAdmin && (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setError(''); setShowMemberModal(true); }}>
                <IconUserPlus size={14} /> Add Member
              </Button>
              <Button size="sm" onClick={() => { setError(''); setShowTaskModal(true); }}>
                <IconPlus size={14} /> Add Task
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this project?')) deleteProject.mutate(); }}>
                <IconTrash size={14} />
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <div className="bg-[#450A0A] border border-[#EF4444]/30 text-[#EF4444] text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#2D3248] mb-6">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab ? 'text-[#F1F5F9] border-b-2 border-[#6366F1]' : 'text-[#475569] hover:text-[#94A3B8]'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Board' && (
        <>
          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-[#475569]">Priority:</span>
            {['', 'LOW', 'MEDIUM', 'HIGH'].map((p) => (
              <button key={p} onClick={() => setFilterPriority(p)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterPriority === p ? 'bg-[#6366F1]/20 text-[#818CF8]' : 'bg-[#22263A] text-[#475569] hover:text-[#94A3B8]'
                }`}>
                {p || 'All'}
              </button>
            ))}
          </div>

          {/* Kanban */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STATUSES.map((status) => {
                const tasks = tasksByStatus(status);
                const colors = STATUS_COLORS[status];
                return (
                  <div key={status} className="bg-[#0F1117] border border-[#2D3248] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D3248]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.dot }} />
                        <span className="text-sm font-medium text-[#F1F5F9]">
                          {status === 'IN_PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: colors.bg, color: colors.dot, border: `1px solid ${colors.border}` }}>
                        {tasks.length}
                      </span>
                    </div>
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}
                          className={`p-3 space-y-2 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-[#6366F1]/5' : ''}`}>
                          {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!canEditTask(task)}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                  className={`bg-[#1A1D27] border border-[#2D3248] rounded-lg p-3 transition-all duration-150 ${
                                    snapshot.isDragging ? 'scale-[1.02] shadow-[0_8px_24px_rgba(0,0,0,0.4)]' : 'hover:border-[#3D4266]'
                                  }`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="text-sm font-medium text-[#F1F5F9]">{task.title}</p>
                                    <div className="flex items-center gap-1 ml-2">
                                      <PriorityBadge priority={task.priority} />
                                      {isProjectAdmin && (
                                        <button onClick={() => deleteTask.mutate(task.id)} className="p-0.5 text-[#475569] hover:text-[#EF4444] transition-colors">
                                          <IconX size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {task.description && (
                                    <p className="text-xs text-[#475569] mb-2 line-clamp-2">{task.description}</p>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2 text-xs text-[#475569]">
                                      {task.dueDate && (
                                        <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-[#EF4444]' : ''}`}>
                                          <IconCalendar size={11} />
                                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                      )}
                                    </div>
                                    {task.assignee && (
                                      <div className="w-6 h-6 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-xs font-medium text-[#818CF8]">
                                        {task.assignee.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </>
      )}

      {activeTab === 'Members' && (
        <div className="bg-[#1A1D27] border border-[#2D3248] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D3248]">
                <th className="text-left text-xs font-medium text-[#475569] uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-[#475569] uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-[#475569] uppercase tracking-wider px-5 py-3">Joined</th>
                {isProjectAdmin && <th className="text-right text-xs font-medium text-[#475569] uppercase tracking-wider px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {project.members?.map((m) => (
                <tr key={m.userId} className="border-b border-[#2D3248] last:border-0 hover:bg-[#22263A] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-sm font-medium text-[#818CF8]">
                        {m.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#F1F5F9]">{m.user.name}</p>
                        <p className="text-xs text-[#475569]">{m.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><RoleBadge role={m.role} /></td>
                  <td className="px-5 py-3 text-sm text-[#475569]">
                    {new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  {isProjectAdmin && (
                    <td className="px-5 py-3 text-right">
                      {m.userId !== user?.id && (
                        <button onClick={() => removeMember.mutate(m.userId)}
                          className="text-xs text-[#EF4444] hover:underline">Remove</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowTaskModal(false)}>
          <div className="bg-[#1A1D27] border border-[#2D3248] rounded-xl p-6 w-full max-w-md mx-4 animate-fade-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">New Task</h2>
            <form onSubmit={(e) => { e.preventDefault(); createTask.mutate(taskForm); }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#F1F5F9]">Title</label>
                <input type="text" required minLength={3} maxLength={120} value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full h-10 px-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-[3px] focus:ring-[#6366F1]/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#F1F5F9]">Description</label>
                <textarea rows={2} value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-[3px] focus:ring-[#6366F1]/20 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#F1F5F9]">Priority</label>
                  <select value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] transition-all">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#F1F5F9]">Due date</label>
                  <input type="date" value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full h-10 px-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] transition-all [color-scheme:dark]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#F1F5F9]">Assignee</label>
                <select value={taskForm.assigneeId}
                  onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                  className="w-full h-10 px-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] transition-all">
                  <option value="">Unassigned</option>
                  {project.members?.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowMemberModal(false)}>
          <div className="bg-[#1A1D27] border border-[#2D3248] rounded-xl p-6 w-full max-w-md mx-4 animate-fade-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Add Member</h2>
            <form onSubmit={(e) => { e.preventDefault(); addMember.mutate(memberForm); }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#F1F5F9]">Email</label>
                <input type="email" required value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full h-10 px-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#F1F5F9]">Role</label>
                <select value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full h-10 px-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] transition-all">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowMemberModal(false)}>Cancel</Button>
                <Button type="submit">Add Member</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

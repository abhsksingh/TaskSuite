import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconFolder, IconPlus, IconCalendar, IconDotsVertical } from '@tabler/icons-react';
import api from '../lib/axios';
import Button from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';

export default function Projects() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data.projects),
  });

  const createProject = useMutation({
    mutationFn: (d) => api.post('/projects', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      setForm({ title: '', description: '', deadline: '' });
      setError('');
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create project'),
  });

  return (
    <div className="animate-fade-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]" style={{ letterSpacing: '-0.3px' }}>Projects</h1>
          <p className="text-sm text-[#475569] mt-1">Manage your projects and track progress</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <IconPlus size={16} />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !data?.length ? (
        <div className="text-center py-16">
          <IconFolder size={48} className="mx-auto text-[#475569] mb-4" />
          <h3 className="text-lg font-medium text-[#F1F5F9] mb-2">No projects yet</h3>
          <p className="text-sm text-[#475569] mb-6">Create your first project to get started</p>
          <Button onClick={() => setShowModal(true)}>
            <IconPlus size={16} />
            New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((project, idx) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group bg-[#1A1D27] border border-[#2D3248] rounded-xl p-5 hover:border-[#3D4266] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-150 animate-fade-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                  <IconFolder size={18} className="text-[#818CF8]" />
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#475569] hover:text-[#94A3B8]"
                  onClick={(e) => { e.preventDefault(); }}>
                  <IconDotsVertical size={16} />
                </button>
              </div>
              <h3 className="text-base font-semibold text-[#F1F5F9] mb-1">{project.title}</h3>
              {project.description && (
                <p className="text-sm text-[#475569] line-clamp-2 mb-3">{project.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-[#475569] mb-4">
                {project.deadline && (
                  <span className="flex items-center gap-1">
                    <IconCalendar size={12} />
                    {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <span>{project._count?.members ?? 0} {(project._count?.members ?? 0) === 1 ? 'member' : 'members'}</span>
                <span>{project._count?.tasks ?? 0} tasks</span>
              </div>
              {project._count?.tasks > 0 && (
                <div className="flex gap-1">
                  <div className="flex-1 h-1.5 bg-[#22263A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.random() * 60 + 20}%` }} />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-[#1A1D27] border border-[#2D3248] rounded-xl p-6 w-full max-w-md mx-4 animate-fade-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">New Project</h2>
            {error && <div className="bg-[#450A0A] border border-[#EF4444]/30 text-[#EF4444] text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={(e) => { e.preventDefault(); createProject.mutate(form); }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#F1F5F9]">Title</label>
                <input type="text" required minLength={3} maxLength={80} value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-10 px-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-[3px] focus:ring-[#6366F1]/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#F1F5F9]">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-[3px] focus:ring-[#6366F1]/20 transition-all resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#F1F5F9]">Deadline</label>
                <input type="date" value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full h-10 px-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] focus:ring-[3px] focus:ring-[#6366F1]/20 transition-all [color-scheme:dark]" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

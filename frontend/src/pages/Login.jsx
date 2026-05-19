import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconMail, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';
import api from '../lib/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) { navigate('/dashboard', { replace: true }); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.accessToken, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4">
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-[440px] animate-fade-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#6366F1] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-[#F1F5F9]" style={{ letterSpacing: '-0.5px' }}>TaskSuite</span>
          </div>
          <p className="text-sm text-[#475569]">Sign in to manage your projects and tasks</p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1D27] border border-[#2D3248] rounded-xl p-8 space-y-6">
          <div className="flex gap-4 border-b border-[#2D3248] pb-4">
            <span className="text-sm font-medium text-[#F1F5F9] pb-4 border-b-2 border-[#6366F1] -mb-4">Sign In</span>
            <Link to="/signup" className="text-sm font-medium text-[#475569] hover:text-[#94A3B8] pb-4 -mb-4 transition-colors">Sign Up</Link>
          </div>

          {error && (
            <div className="bg-[#450A0A] border border-[#EF4444]/30 text-[#EF4444] text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F1F5F9]">Email</label>
              <div className="relative">
                <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type="email" required placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 pl-10 pr-3 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-[3px] focus:ring-[#6366F1]/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F1F5F9]">Password</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type={showPw ? 'text' : 'password'} required placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-10 pl-10 pr-10 bg-[#0F1117] border border-[#2D3248] rounded-lg text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-[3px] focus:ring-[#6366F1]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8]">
                  {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-10 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-[#4F46E5] transition-colors active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Test credentials */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#475569]">
            Demo: <span className="text-[#94A3B8]">admin@example.com</span> / <span className="text-[#94A3B8]">Admin1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}

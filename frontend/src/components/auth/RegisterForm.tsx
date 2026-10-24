import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
  onSwitch: () => void;
}

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin',
    adminCode: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        adminCode: form.role === 'admin' ? form.adminCode : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Create account</h2>
          <p className="text-gray-400 text-sm mt-1">Join the dealership system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Username</label>
            <input type="text" className="input" placeholder="johndoe" value={form.username}
              onChange={set('username')} required minLength={3} autoComplete="username" />
          </div>

          <div>
            <label className="input-label">Email address</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email}
              onChange={set('email')} required autoComplete="email" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={form.password}
                onChange={set('password')} required minLength={6} autoComplete="new-password" />
            </div>
            <div>
              <label className="input-label">Confirm</label>
              <input type="password" className="input" placeholder="••••••••" value={form.confirmPassword}
                onChange={set('confirmPassword')} required autoComplete="new-password" />
            </div>
          </div>

          <div>
            <label className="input-label">Account type</label>
            <select className="select" value={form.role} onChange={set('role')}>
              <option value="user">Regular User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {form.role === 'admin' && (
            <div className="animate-fade-in">
              <label className="input-label">Admin Access Code</label>
              <input type="password" className="input" placeholder="Enter admin code"
                value={form.adminCode} onChange={set('adminCode')} />
              <p className="text-xs text-gray-500 mt-1">Required to activate admin privileges</p>
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </span>
            ) : 'Create account'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

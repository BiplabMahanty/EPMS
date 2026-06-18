import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi, employeeAuthApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useEmployeeStore } from '../../store';
import { Button, Input } from '../../components/ui/FormElements';

export default function Login() {
  const [role, setRole] = useState('admin');
  const { setAuth } = useAuth();
  const setEmployeeAuth = useEmployeeStore((s) => s.setAuth);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      if (role === 'admin') {
        const res = await authApi.login(data);
        setAuth(res.data.user, res.data.accessToken);
        navigate('/dashboard');
      } else {
        const res = await employeeAuthApi.login(data);
        setEmployeeAuth(res.data.employee, res.data.accessToken);
        navigate('/employee/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--esp-surface)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ESP</h1>
        <p style={{ color: 'var(--esp-text-muted)', marginBottom: 20, fontSize: 14 }}>Sign in to your account</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--esp-bg)', borderRadius: 8, padding: 4 }}>
          {['admin', 'employee'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                background: role === r ? 'var(--esp-primary)' : 'transparent',
                color: role === r ? '#fff' : 'var(--esp-text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {r === 'admin' ? 'Admin / Owner' : 'Employee'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <Input {...register('email')} type="email" required placeholder="you@business.com" />
          </div>
          {role === 'employee' && (
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <Input {...register('employeeId')} required placeholder="EMP0001" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Password</label>
            <Input {...register('password')} type="password" required placeholder="••••••••" />
          </div>
          <Button type="submit" loading={isSubmitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            Sign In
          </Button>
        </form>

        {role === 'admin' && (
          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--esp-text-muted)' }}>
            New business? <Link to="/register" style={{ color: 'var(--esp-primary)' }}>Register</Link>
            {' · '}
            <Link to="/forgot-password" style={{ color: 'var(--esp-primary)' }}>Forgot password?</Link>
          </p>
        )}
      </div>
    </div>
  );
}

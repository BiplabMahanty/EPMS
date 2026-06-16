import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components/ui/FormElements';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);
      setAuth(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--esp-surface)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ESP</h1>
        <p style={{ color: 'var(--esp-text-muted)', marginBottom: 28, fontSize: 14 }}>Sign in to your business</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <Input {...register('email')} type="email" placeholder="you@business.com" error={errors.email?.message} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <Input {...register('password')} type="password" placeholder="••••••••" error={errors.password?.message} />
          </div>
          <Button type="submit" loading={isSubmitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Sign In</Button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--esp-text-muted)' }}>
          New business? <Link to="/register" style={{ color: 'var(--esp-primary)' }}>Register</Link>
          {' · '}
          <Link to="/forgot-password" style={{ color: 'var(--esp-primary)' }}>Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}

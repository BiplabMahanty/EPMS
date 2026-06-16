import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components/ui/FormElements';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().min(2),
});

export default function Register() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await authApi.register(data);
      setAuth(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--esp-surface)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Create your business</h1>
        <p style={{ color: 'var(--esp-text-muted)', marginBottom: 28, fontSize: 14 }}>Get started with ESP for free</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <Input {...register('name')} placeholder="Full name" error={errors.name?.message} />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <Input {...register('businessName')} placeholder="Acme Traders" error={errors.businessName?.message} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <Input {...register('email')} type="email" placeholder="you@business.com" error={errors.email?.message} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <Input {...register('password')} type="password" placeholder="Min 6 characters" error={errors.password?.message} />
          </div>
          <Button type="submit" loading={isSubmitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Create Account</Button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--esp-text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--esp-primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

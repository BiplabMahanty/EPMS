import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { Button, Input } from '../../components/ui/FormElements';
import { useState } from 'react';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await authApi.forgotPassword(data);
      setSent(true);
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--esp-surface)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 380, padding: 32 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Reset password</h2>
        {sent ? (
          <p style={{ color: 'var(--esp-text-secondary)', fontSize: 14 }}>If that email exists, a reset link has been sent. Check your inbox.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label">Email</label>
              <Input {...register('email')} type="email" placeholder="you@business.com" />
            </div>
            <Button type="submit" loading={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>Send reset link</Button>
          </form>
        )}
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}><Link to="/login" style={{ color: 'var(--esp-primary)' }}>← Back to login</Link></p>
      </div>
    </div>
  );
}

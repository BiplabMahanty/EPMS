import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeAuthApi } from '../../services/api';
import { useEmployeeStore } from '../../store';
import { Input, Button } from '../../components/ui/FormElements';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const setAuth = useEmployeeStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log('data', data);
      const res = await employeeAuthApi.login(data);
      setAuth(res.data.employee, res.data.accessToken);
      navigate('/employee/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--esp-surface)' }}>
      <div className="card card-body" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Employee Portal</h2>
          <p style={{ color: 'var(--esp-text-muted)', marginTop: 4, fontSize: 14 }}>Sign in to your employee account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <Input {...register('employeeId')} required placeholder="EMP0001" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <Input {...register('password')} type="password" required />
          </div>
          <Button type="submit" loading={isSubmitting} style={{ width: '100%', marginTop: 8 }}>Sign In</Button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <a href="/login" style={{ color: 'var(--esp-text-muted)' }}>← Admin Login</a>
        </div>
      </div>
    </div>
  );
}

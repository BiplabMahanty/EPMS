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
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background:
        'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%)',
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px',
        borderRadius: '28px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow:
          '0 20px 50px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.05)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background:
                'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 15px 35px rgba(245,158,11,0.35)',
            }}
          >
            <img
              src="/dutta logo.png"
              alt="Dutta Hardware"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
              }}
            />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: '800',
                color: '#111827',
                lineHeight: 1,
              }}
            >
              Dutta
            </h1>

            <div
              style={{
                color: '#f59e0b',
                fontSize: '12px',
                letterSpacing: '4px',
                fontWeight: '700',
                textTransform: 'uppercase',
                marginTop: '6px',
              }}
            >
              Hardware
            </div>
          </div>
        </div>
      </div>

      <p
        style={{
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '28px',
          fontSize: '15px',
          fontWeight: '500',
        }}
      >
        Welcome back. Sign in to continue.
      </p>

      {/* Role Switch */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '28px',
          background: '#f8fafc',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        {['admin', 'employee'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all .25s ease',
              background:
                role === r
                  ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                  : 'transparent',
              color: role === r ? '#fff' : '#64748b',
              boxShadow:
                role === r
                  ? '0 8px 20px rgba(245,158,11,0.25)'
                  : 'none',
            }}
          >
            {r === 'admin' ? 'Admin / Owner' : 'Employee'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            Email
          </label>

          <Input
            {...register('email')}
            type="email"
            required
            placeholder="you@business.com"
          />
        </div>

        {role === 'employee' && (
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Employee ID
            </label>

            <Input
              {...register('employeeId')}
              required
              placeholder="EMP0001"
            />
          </div>
        )}

        <div style={{ marginBottom: '18px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            Password
          </label>

          <Input
            {...register('password')}
            type="password"
            required
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          style={{
            width: '100%',
            justifyContent: 'center',
            marginTop: '14px',
            height: '52px',
            borderRadius: '14px',
            background:
              'linear-gradient(135deg,#f59e0b,#d97706)',
            fontWeight: '700',
            fontSize: '15px',
            boxShadow:
              '0 10px 25px rgba(245,158,11,0.35)',
          }}
        >
          Sign In
        </Button>
      </form>

      {role === 'admin' && (
        <p
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#64748b',
            lineHeight: 1.8,
          }}
        >
          New business?{' '}
          <Link
            to="/register"
            style={{
              color: '#f59e0b',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Register
          </Link>

          {' • '}

          <Link
            to="/forgot-password"
            style={{
              color: '#f59e0b',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Forgot Password?
          </Link>
        </p>
      )}
    </div>
  </div>
);
}

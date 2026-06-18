import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { employeeAuthApi } from '../../services/api';
import EmployeeLayout from './EmployeeLayout';
import { Button, Input } from '../../components/ui/FormElements';
import ImageUpload from '../../components/ui/ImageUpload';

export default function EmployeeProfile() {
  const qc = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [changePwd, setChangePwd] = useState(false);
  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd } = useForm();

  const { data: profile, isLoading } = useQuery({ queryKey: ['emp-profile'], queryFn: () => employeeAuthApi.getProfile().then((r) => r.data) });
  const { register, handleSubmit } = useForm({ values: profile });

  const updateProfile = useMutation({
    mutationFn: (d) => {
      const fd = new FormData();
      if (d.phone) fd.append('phone', d.phone);
      if (photoFile) fd.append('image', photoFile);
      return employeeAuthApi.updateProfile(fd);
    },
    onSuccess: () => { qc.invalidateQueries(['emp-profile']); toast.success('Profile updated'); setEditMode(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const changePwdMutation = useMutation({
    mutationFn: (d) => employeeAuthApi.changePassword(d),
    onSuccess: () => { toast.success('Password changed'); setChangePwd(false); resetPwd(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <EmployeeLayout title="Profile"><div style={{ color: 'var(--esp-text-muted)' }}>Loading…</div></EmployeeLayout>;

  return (
    <EmployeeLayout title="My Profile">
      <div style={{ maxWidth: 520 }}>
        <div className="card card-body" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <img src={profile?.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.name || 'E')} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--esp-border)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{profile?.name}</div>
            <div style={{ color: 'var(--esp-text-muted)', fontSize: 14 }}>{profile?.designation || 'Employee'}</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>ID: {profile?.employeeId}</div>
          </div>
        </div>

        <div className="card card-body" style={{ marginBottom: 16 }}>
          {editMode ? (
            <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))}>
              <div className="form-group"><ImageUpload label="Photo" onChange={setPhotoFile} value={profile?.photo} /></div>
              <div className="form-group"><label className="form-label">Phone</label><Input {...register('phone')} /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button type="submit" loading={updateProfile.isPending}>Save</Button>
                <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Email', profile?.email], ['Phone', profile?.phone || '—'], ['Department', profile?.department || '—'], ['Joining Date', profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '—']].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: 12, color: 'var(--esp-text-muted)' }}>{l}</div><div style={{ fontWeight: 500 }}>{v}</div></div>
                ))}
              </div>
              <Button variant="secondary" onClick={() => setEditMode(true)} style={{ marginTop: 16 }}>Edit Profile</Button>
            </>
          )}
        </div>

        <div className="card card-body">
          {changePwd ? (
            <form onSubmit={handlePwd((d) => changePwdMutation.mutate(d))}>
              <div className="form-group"><label className="form-label">Current Password</label><Input {...regPwd('currentPassword')} type="password" required /></div>
              <div className="form-group"><label className="form-label">New Password</label><Input {...regPwd('newPassword')} type="password" required /></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button type="submit" loading={changePwdMutation.isPending}>Change Password</Button>
                <Button type="button" variant="secondary" onClick={() => setChangePwd(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <Button variant="secondary" onClick={() => setChangePwd(true)}>Change Password</Button>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeAuthApi } from '../../services/api';
import EmployeeLayout from './EmployeeLayout';
import { Button } from '../../components/ui/FormElements';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function EmployeeAttendance() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['emp-attendance'],
    queryFn: () => employeeAuthApi.attendanceHistory({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), to: today }).then((r) => r.data),
  });

  const todayRecord = history.find((h) => h.date === today);

  const checkIn = useMutation({
    mutationFn: () => employeeAuthApi.checkIn(),
    onSuccess: () => { qc.invalidateQueries(['emp-attendance']); toast.success('Checked in!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const checkOut = useMutation({
    mutationFn: () => employeeAuthApi.checkOut(),
    onSuccess: () => { qc.invalidateQueries(['emp-attendance']); toast.success('Checked out!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <EmployeeLayout title="Attendance">
      <div style={{ maxWidth: 600 }}>
        <div className="card card-body" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--esp-text-muted)' }}>Today — {format(new Date(), 'dd MMM yyyy')}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>
              {todayRecord?.checkIn ? `In: ${format(new Date(todayRecord.checkIn), 'hh:mm a')}` : 'Not checked in yet'}
              {todayRecord?.checkOut && ` · Out: ${format(new Date(todayRecord.checkOut), 'hh:mm a')}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {!todayRecord?.checkIn && <Button onClick={() => checkIn.mutate()} loading={checkIn.isPending}>Check In</Button>}
            {todayRecord?.checkIn && !todayRecord?.checkOut && <Button variant="secondary" onClick={() => checkOut.mutate()} loading={checkOut.isPending}>Check Out</Button>}
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table className="esp-table">
              <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
              <tbody>
                {isLoading && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{format(new Date(h.date), 'dd MMM yyyy')}</td>
                    <td>{h.checkIn ? format(new Date(h.checkIn), 'hh:mm a') : '—'}</td>
                    <td>{h.checkOut ? format(new Date(h.checkOut), 'hh:mm a') : '—'}</td>
                    <td><span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: 'var(--esp-success-light)', color: 'var(--esp-success)' }}>{h.status}</span></td>
                  </tr>
                ))}
                {!isLoading && !history.length && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--esp-text-muted)' }}>No attendance records</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

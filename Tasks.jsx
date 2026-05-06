import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, isAfter, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const COLORS = ['#f59e0b', '#6366f1', '#10b981'];
const STATUS_LABELS = { todo: 'To Do', inprogress: 'In Progress', completed: 'Completed' };

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats();
      setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="loading-spinner" /></div>;

  const statusData = stats ? [
    { name: 'To Do', value: stats.todoTasks, color: '#f59e0b' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#6366f1' },
    { name: 'Completed', value: stats.completedTasks, color: '#10b981' }
  ] : [];

  const projectData = stats?.tasksByProject?.map(p => ({
    name: p.projectName?.length > 12 ? p.projectName.slice(0, 12) + '…' : p.projectName,
    tasks: p.count
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            {isAdmin ? '⚡ Admin Dashboard' : '👋 My Dashboard'}
          </h2>
          <p className="page-subtitle">
            Welcome back, <strong>{user.name}</strong>! Here's what's happening today.
          </p>
        </div>
        <div className="page-header-actions">
          {isAdmin && <Link to="/projects" className="btn btn-primary">+ New Project</Link>}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--card-accent': '#6366f1' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>📊</div>
          <div className="stat-info"><h3>{stats?.totalTasks ?? 0}</h3><p>Total Tasks</p></div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#f59e0b' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>📝</div>
          <div className="stat-info"><h3>{stats?.todoTasks ?? 0}</h3><p>To Do</p></div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#3b82f6' }}>
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>⚙️</div>
          <div className="stat-info"><h3>{stats?.inProgressTasks ?? 0}</h3><p>In Progress</p></div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#10b981' }}>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>✅</div>
          <div className="stat-info"><h3>{stats?.completedTasks ?? 0}</h3><p>Completed</p></div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#ef4444' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>⚠️</div>
          <div className="stat-info"><h3>{stats?.overdueTasks ?? 0}</h3><p>Overdue</p></div>
        </div>
        <div className="stat-card" style={{ '--card-accent': '#8b5cf6' }}>
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>📁</div>
          <div className="stat-info"><h3>{stats?.totalProjects ?? 0}</h3><p>Projects</p></div>
        </div>
        {isAdmin && (
          <div className="stat-card" style={{ '--card-accent': '#06b6d4' }}>
            <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.1)' }}>👥</div>
            <div className="stat-info"><h3>{stats?.totalUsers ?? 0}</h3><p>Team Members</p></div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">📈 Tasks by Status</h3>
          {stats?.totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon" style={{ width: 48, height: 48, fontSize: 22, marginBottom: 8 }}>📊</div>
              <p>No task data yet</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">📁 Tasks by Project</h3>
          {projectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon" style={{ width: 48, height: 48, fontSize: 22, marginBottom: 8 }}>📁</div>
              <p>No project data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {stats?.upcomingDeadlines?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">⏰ Upcoming Deadlines (Next 7 Days)</span>
          </div>
          <div className="card-body" style={{ padding: '16px 24px' }}>
            {stats.upcomingDeadlines.map(task => (
              <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="warning-dot" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.project?.title}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)' }}>
                  {task.dueDate ? format(parseISO(task.dueDate), 'MMM d') : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Progress */}
      {stats?.totalTasks > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">🎯 Overall Progress</span></div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Completion Rate</span>
              <strong>{Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</strong>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              {statusData.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                  <span style={{ color: 'var(--text-muted)' }}>{s.name}:</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

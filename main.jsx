import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { toggle, isDark } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/projects', icon: '📁', label: 'Projects' },
    { to: '/tasks', icon: '✅', label: 'Tasks' },
    ...(isAdmin ? [{ to: '/members', icon: '👥', label: 'Members' }] : [])
  ];

  const pageTitle = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your workspace' },
    '/projects': { title: 'Projects', subtitle: 'Manage all your projects' },
    '/tasks': { title: 'Tasks', subtitle: 'Track and manage tasks' },
    '/members': { title: 'Members', subtitle: 'Manage team members' }
  };

  const current = Object.entries(pageTitle).find(([path]) => location.pathname.startsWith(path)) || ['/dashboard', pageTitle['/dashboard']];
  const { title, subtitle } = current[1];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">📋</div>
          <div>
            <h1>TaskFlow</h1>
            <p>{isAdmin ? 'Admin Portal' : 'Member Portal'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏏</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topnav">
          <div>
            <div className="topnav-title">{title}</div>
            <div className="topnav-subtitle">{subtitle}</div>
          </div>
          <div className="topnav-right">
            <button className="theme-toggle" onClick={toggle} title="Toggle dark mode">
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 13, cursor: 'default' }}>
              {getInitials(user?.name)}
            </div>
          </div>
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

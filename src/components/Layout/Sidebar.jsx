import { LayoutDashboard, PlusCircle, List, FileText, Settings, LogOut, CreditCard, Bell, Shield } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { supabase } from '../../utils/supabaseClient';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add', label: 'Nuevo Gasto', icon: PlusCircle },
  { id: 'expenses', label: 'Mis Gastos', icon: List },
  { id: 'reports', label: 'Reportes', icon: FileText },
  { id: 'reminders', label: 'Recordatorios', icon: Bell },
  { id: 'subscription', label: 'Plan Premium', icon: CreditCard },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { state, dispatch } = useExpenses();
  const isAdmin = state.user?.email === 'jefferson_15_6@hotmail.com';

  const handleNavClick = (id) => {
    dispatch({ type: 'SET_VIEW', payload: id });
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">CE</div>
        <div className="brand-text">
          <h1>Cuenta Exacta</h1>
          <span>Control de gastos</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item ${state.currentView === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon className="nav-icon" />
            {item.label}
          </button>
        ))}
        
        {isAdmin && (
          <button
            id="nav-admin"
            className={`nav-item ${state.currentView === 'admin' ? 'active' : ''}`}
            onClick={() => handleNavClick('admin')}
            style={{ color: 'var(--accent-light)' }}
          >
            <Shield className="nav-icon" style={{ color: 'var(--accent-light)' }} />
            Accesos (Admin)
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut className="nav-icon" style={{ color: 'var(--danger)' }} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

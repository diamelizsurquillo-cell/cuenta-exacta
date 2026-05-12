import { Moon, Sun, Menu } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

const viewTitles = {
  dashboard: { title: 'Dashboard', sub: 'Resumen de tus finanzas personales' },
  add: { title: 'Registrar Gasto', sub: 'Agrega un nuevo gasto a tu registro' },
  expenses: { title: 'Mis Gastos', sub: 'Historial completo de gastos' },
  reports: { title: 'Reportes', sub: 'Análisis y exportación de datos' },
  subscription: { title: 'Planes de Suscripción', sub: 'Elige el mejor plan para ti' },
  settings: { title: 'Configuración', sub: 'Gestiona tu cuenta y categorías' },
  reminders: { title: 'Recordatorios', sub: 'Control de deudas y pagos fijos' },
};

export default function Header({ currentView, onMenuToggle }) {
  const { state, dispatch } = useExpenses();
  const info = viewTitles[currentView] || viewTitles.dashboard;
  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <header className="header" id="main-header">
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="mobile-toggle" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <div>
          <h2>{info.title}</h2>
          <p className="header-sub" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{info.sub}</p>
        </div>
      </div>
      <div className="header-right">
        <span className="header-date hide-mobile">📅 {today}</span>
        <button 
          className="btn-icon" 
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          title={state.theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

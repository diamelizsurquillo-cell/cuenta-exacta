import { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import ExpenseForm from './components/Expenses/ExpenseForm';
import ExpenseList from './components/Expenses/ExpenseList';
import Reports from './components/Reports/Reports';
import Login from './components/Auth/Login';
import Pricing from './components/Subscription/Pricing';
import Settings from './components/Settings/Settings';
import Reminders from './components/Reminders/Reminders';
import AdminPanel from './components/Admin/AdminPanel';
import { useExpenses } from './context/ExpenseContext';
import { supabase } from './utils/supabaseClient';

function App() {
  const { state, dispatch } = useExpenses();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    const fetchProfile = async (userId) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        dispatch({ type: 'SET_USER_PROFILE', payload: data });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch({ type: 'SET_USER', payload: session.user });
        dispatch({ type: 'LOGIN' });
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch({ type: 'SET_USER', payload: session.user });
        dispatch({ type: 'LOGIN' });
        fetchProfile(session.user.id);
      } else {
        dispatch({ type: 'LOGOUT' });
        dispatch({ type: 'SET_USER_PROFILE', payload: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  if (!state.isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (state.currentView) {
      case 'dashboard': return <Dashboard />;
      case 'add': return <ExpenseForm />;
      case 'expenses': return <ExpenseList />;
      case 'reports': return <Reports />;
      case 'reminders': return <Reminders />;
      case 'subscription': return <Pricing />;
      case 'settings': return <Settings />;
      case 'admin': return <AdminPanel />;
      default: return <Dashboard />;
    }
  };

  const renderFreeTrialBanner = () => {
    if (!state.userProfile || state.userProfile.plan !== 'free') return null;

    const createdDate = new Date(state.userProfile.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = 30 - diffDays;

    if (remaining <= 0) {
       return (
         <div style={{ background: 'var(--danger)', color: 'white', padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', zIndex: 100 }}>
           Tu mes de prueba ha finalizado. Por favor, adquiere un plan para seguir usando la aplicación.
         </div>
       );
    }

    return (
      <div style={{ background: 'linear-gradient(to right, var(--accent), var(--violet))', color: 'white', padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', zIndex: 100 }}>
        Cuenta gratis por 01 mes. Te quedan {remaining} días de prueba.
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {renderFreeTrialBanner()}
        <Header 
          currentView={state.currentView} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="page-content">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch({ type: 'SET_USER', payload: session.user });
        dispatch({ type: 'LOGIN' });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch({ type: 'SET_USER', payload: session.user });
        dispatch({ type: 'LOGIN' });
      } else {
        dispatch({ type: 'LOGOUT' });
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
      
      <main className="main-content">
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

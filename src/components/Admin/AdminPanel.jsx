import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useExpenses } from '../../context/ExpenseContext';
import { Search, Shield, CheckCircle, Clock } from 'lucide-react';

export default function AdminPanel() {
  const { state } = useExpenses();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Verificación de seguridad en el frontend
  const isAdmin = state.user?.email === 'jefferson_15_6@hotmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleUpdatePlan = async (userId, newPlan) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('profiles')
      .update({ plan: newPlan, plan_started_at: now })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan, plan_started_at: now } : u));
    } else {
      alert('Error al actualizar el plan');
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Shield size={48} style={{ color: 'var(--danger)', margin: '0 auto 20px' }} />
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos de administrador para ver esta página.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fade-in-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar por correo electrónico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <button className="btn btn-ghost" onClick={fetchUsers}>Actualizar Lista</button>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} style={{ color: 'var(--accent)' }} /> 
          Usuarios Registrados ({filteredUsers.length})
        </h3>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando usuarios...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <th style={{ padding: '12px 10px' }}>Usuario (Correo)</th>
                  <th style={{ padding: '12px 10px' }}>Plan Actual</th>
                  <th style={{ padding: '12px 10px' }}>Acciones (Cambiar Plan)</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '15px 10px', fontWeight: '500' }}>{user.email}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px',
                        fontWeight: '600',
                        background: user.plan === 'anual' ? 'var(--success-bg)' : user.plan === 'mensual' ? 'var(--accent-bg)' : 'var(--bg-secondary)',
                        color: user.plan === 'anual' ? 'var(--success)' : user.plan === 'mensual' ? 'var(--accent-light)' : 'var(--text-muted)',
                      }}>
                        {user.plan === 'anual' ? 'Anual' : user.plan === 'mensual' ? 'Mensual' : 'Gratis'}
                      </span>
                    </td>
                    <td style={{ padding: '15px 10px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleUpdatePlan(user.id, 'free')}
                          className="btn btn-ghost btn-sm"
                          disabled={user.plan === 'free'}
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          Gratis
                        </button>
                        <button 
                          onClick={() => handleUpdatePlan(user.id, 'mensual')}
                          className="btn btn-primary btn-sm"
                          disabled={user.plan === 'mensual'}
                          style={{ fontSize: '12px', padding: '5px 10px', background: 'var(--accent)' }}
                        >
                          Mes (S/20)
                        </button>
                        <button 
                          onClick={() => handleUpdatePlan(user.id, 'anual')}
                          className="btn btn-primary btn-sm"
                          disabled={user.plan === 'anual'}
                          style={{ fontSize: '12px', padding: '5px 10px', background: 'var(--success)', borderColor: 'var(--success)' }}
                        >
                          Anual (S/80)
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>No se encontraron usuarios.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

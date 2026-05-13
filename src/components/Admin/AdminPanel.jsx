import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useExpenses, calculatePlanInfo } from '../../context/ExpenseContext';
import { Search, Shield, CheckCircle, Clock, MessageCircle } from 'lucide-react';

export default function AdminPanel() {
  const { state } = useExpenses();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null, newPlan: null, password: '', error: '', loading: false });

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

  const handleUpdatePlan = (userId, newPlan) => {
    setConfirmModal({ isOpen: true, userId, newPlan, password: '', error: '', loading: false });
  };

  const handleConfirmUpdate = async (e) => {
    e.preventDefault();
    setConfirmModal(prev => ({ ...prev, loading: true, error: '' }));
    
    const adminEmail = state.user.email;
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: confirmModal.password
    });

    if (authError) {
      setConfirmModal(prev => ({ ...prev, loading: false, error: 'Contraseña incorrecta. Inténtalo de nuevo.' }));
      return;
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('profiles')
      .update({ plan: confirmModal.newPlan, plan_started_at: now })
      .eq('id', confirmModal.userId);

    if (!error) {
      setUsers(users.map(u => u.id === confirmModal.userId ? { ...u, plan: confirmModal.newPlan, plan_started_at: now } : u));
      setConfirmModal({ isOpen: false, userId: null, newPlan: null, password: '', error: '', loading: false });
    } else {
      setConfirmModal(prev => ({ ...prev, loading: false, error: 'Error al actualizar el plan en la base de datos.' }));
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
                  <th style={{ padding: '12px 10px' }}>Usuario</th>
                  <th style={{ padding: '12px 10px' }}>WhatsApp</th>
                  <th style={{ padding: '12px 10px' }}>Plan / Días Restantes</th>
                  <th style={{ padding: '12px 10px' }}>Acciones (Cambiar Plan)</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const userPlanInfo = calculatePlanInfo(user);
                  return (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '15px 10px', fontWeight: '500' }}>{user.email}</td>
                    <td style={{ padding: '15px 10px' }}>
                      {user.whatsapp ? (
                        <a href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#25D366', textDecoration: 'none', fontWeight: 'bold' }}>
                          <MessageCircle size={16} /> {user.whatsapp}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin número</span>
                      )}
                    </td>
                    <td style={{ padding: '15px 10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px',
                          fontWeight: '600',
                          width: 'fit-content',
                          background: user.plan === 'anual' ? 'var(--success-bg)' : user.plan === 'mensual' ? 'var(--accent-bg)' : 'var(--bg-secondary)',
                          color: user.plan === 'anual' ? 'var(--success)' : user.plan === 'mensual' ? 'var(--accent-light)' : 'var(--text-muted)',
                        }}>
                          {user.plan === 'anual' ? 'Anual' : user.plan === 'mensual' ? 'Mensual' : 'Gratis'}
                        </span>
                        {userPlanInfo && (
                          <span style={{ fontSize: '12px', color: userPlanInfo.remaining <= 5 ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {userPlanInfo.remaining > 0 ? `${userPlanInfo.remaining} días` : 'Expirado'}
                          </span>
                        )}
                      </div>
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
                )})}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>No se encontraron usuarios.</p>
            )}
          </div>
        )}
      </div>

      {confirmModal.isOpen && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card fade-in-up" style={{ width: '90%', maxWidth: '400px', background: 'var(--bg-primary)' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} style={{ color: 'var(--accent)' }}/>
              Confirmar Autorización
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Para otorgar el plan <strong style={{ color: 'var(--text-primary)' }}>{confirmModal.newPlan === 'anual' ? 'Anual' : confirmModal.newPlan === 'mensual' ? 'Mensual' : 'Gratis'}</strong>, por favor verifica tu identidad ingresando tu contraseña de administrador.
            </p>
            <form onSubmit={handleConfirmUpdate}>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Tu contraseña..."
                value={confirmModal.password}
                onChange={(e) => setConfirmModal({...confirmModal, password: e.target.value})}
                style={{ marginBottom: '15px' }}
                autoFocus
                required 
              />
              {confirmModal.error && (
                <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '15px', background: 'var(--danger-bg)', padding: '10px', borderRadius: '6px' }}>
                  {confirmModal.error}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmModal({ isOpen: false, userId: null, newPlan: null, password: '', error: '', loading: false })}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={confirmModal.loading}>
                  {confirmModal.loading ? 'Verificando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

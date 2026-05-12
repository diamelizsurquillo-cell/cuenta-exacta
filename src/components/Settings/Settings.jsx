import { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { Trash2, Plus, Shield, Tag as TagIcon, Check, AlertCircle, User } from 'lucide-react';
import { generateId } from '../../utils/formatters';

export default function Settings() {
  const { state, dispatch } = useExpenses();
  const { categories, expenses } = state;

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });

  // New Category state
  const [newCat, setNewCat] = useState({ name: '', icon: '📦', color: '#6366f1' });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPassMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }
    setPassMessage({ text: '¡Contraseña cambiada con éxito! (Simulado)', type: 'success' });
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    const category = {
      id: generateId(),
      name: newCat.name.trim(),
      icon: newCat.icon,
      color: newCat.color
    };

    dispatch({ type: 'ADD_CATEGORY', payload: category });
    setNewCat({ name: '', icon: '📦', color: '#6366f1' });
  };

  const handleDeleteCategory = (catId) => {
    // Check if category is used in any expense
    const isUsed = expenses.some(exp => exp.category === catId);
    
    if (isUsed) {
      alert('No puedes eliminar esta categoría porque ya tiene gastos registrados.');
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      dispatch({ type: 'DELETE_CATEGORY', payload: catId });
    }
  };

  const isCategoryUsed = (catId) => {
    return expenses.some(exp => exp.category === catId);
  };

  const planInfo = state.planInfo;

  return (
    <div className="fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* SECTION 0: Account Info */}
      {planInfo && (
        <div className="glass-card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={22} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Información de la Cuenta</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Correo Electrónico:</strong> 
              <span style={{ fontWeight: '500' }}>{planInfo.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Tipo de Plan:</strong> 
              <span style={{ color: planInfo.planColor, fontWeight: 'bold' }}>{planInfo.planName}</span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Tiempo Restante:</strong>
                <span style={{ color: planInfo.remaining <= 5 ? 'var(--danger)' : 'var(--text-primary)', fontWeight: '600' }}>
                  {planInfo.remaining > 0 ? `${planInfo.remaining} días de ${planInfo.duration}` : 'Plan expirado'}
                </span>
              </div>
              <div style={{ marginTop: '10px', height: '10px', background: 'var(--border-glass)', borderRadius: '5px', overflow: 'hidden' }}>
                 <div style={{ 
                   height: '100%', 
                   width: `${Math.max(0, Math.min(100, (planInfo.remaining / planInfo.duration) * 100))}%`, 
                   background: planInfo.remaining <= 5 ? 'var(--danger)' : planInfo.planColor,
                   transition: 'width 0.5s ease'
                 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Password Change */}
      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Shield size={22} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Seguridad</h3>
        </div>
        
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">Contraseña Actual</label>
            <input 
              type="password" 
              className="form-input" 
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              required 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input 
                type="password" 
                className="form-input" 
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                className="form-input" 
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                required 
              />
            </div>
          </div>
          
          {passMessage.text && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '13px', 
              color: passMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
              background: passMessage.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              padding: '10px',
              borderRadius: '6px'
            }}>
              {passMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {passMessage.text}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Cambiar Contraseña
          </button>
        </form>
      </div>

      {/* SECTION 2: Category Management */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <TagIcon size={22} style={{ color: 'var(--warning)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Gestión de Etiquetas (Categorías)</h3>
        </div>

        {/* Add New Category */}
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ width: '80px' }}>
            <label className="form-label">Icono</label>
            <input 
              type="text" 
              className="form-input" 
              value={newCat.icon}
              onChange={(e) => setNewCat({...newCat, icon: e.target.value})}
              placeholder="🍔"
              maxLength={2}
              style={{ textAlign: 'center' }}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Nombre de la Etiqueta</label>
            <input 
              type="text" 
              className="form-input" 
              value={newCat.name}
              onChange={(e) => setNewCat({...newCat, name: e.target.value})}
              placeholder="Ej: Gimnasio, Mascotas..."
              required
            />
          </div>
          <div className="form-group" style={{ width: '80px' }}>
            <label className="form-label">Color</label>
            <input 
              type="color" 
              className="form-input" 
              value={newCat.color}
              onChange={(e) => setNewCat({...newCat, color: e.target.value})}
              style={{ padding: '5px', height: '42px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            <Plus size={16} /> Agregar
          </button>
        </form>

        {/* Directorio de Iconos */}
        <div style={{ marginBottom: '25px' }}>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Directorio de Iconos (Selecciona uno)</label>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap', 
            background: 'var(--bg-glass)', 
            padding: '12px', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-glass)'
          }}>
            {['🍔', '🛒', '🚗', '🏠', '💡', '🎮', '🏥', '📚', '👕', '🎁', '✈️', '💰', '🐾', '🍿', '💇', '🏋️', '🚌', '🍕', '🍻', '☕', '🎟️', '🚲', '💊', '🛠️'].map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setNewCat({...newCat, icon})}
                style={{
                  background: newCat.icon === icon ? 'var(--accent)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'var(--transition)'
                }}
                className={newCat.icon === icon ? 'active' : ''}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Category List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {categories.map(cat => {
            const used = isCategoryUsed(cat.id);
            return (
              <div 
                key={cat.id} 
                className="glass-card" 
                style={{ 
                  padding: '12px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: 'var(--bg-glass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{cat.name}</span>
                    {used && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>En uso</div>}
                  </div>
                </div>
                
                <button 
                  className="btn-icon" 
                  onClick={() => handleDeleteCategory(cat.id)}
                  title={used ? 'No se puede eliminar (en uso)' : 'Eliminar categoría'}
                  style={{ 
                    opacity: used ? 0.3 : 1, 
                    cursor: used ? 'not-allowed' : 'pointer',
                    color: used ? 'var(--text-muted)' : 'var(--danger)'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

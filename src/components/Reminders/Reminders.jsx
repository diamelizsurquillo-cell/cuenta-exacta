import { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { supabase } from '../../utils/supabaseClient';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Bell, Plus, Trash2, Check, Clock } from 'lucide-react';

export default function Reminders() {
  const { state } = useExpenses();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', amount: '', due_date: '' });

  useEffect(() => {
    fetchReminders();
  }, [state.user]);

  const fetchReminders = async () => {
    if (state.user) {
      setLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('due_date', { ascending: true });

      if (!error && data) {
        setReminders(data);
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.due_date) return;

    if (state.user) {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          ...form,
          amount: parseFloat(form.amount),
          user_id: state.user.id,
          status: 'pending'
        }])
        .select();

      if (!error && data) {
        setReminders([...reminders, data[0]]);
        setForm({ title: '', amount: '', due_date: '' });
      }
    }
  };

  const handleToggleStatus = async (reminder) => {
    const newStatus = reminder.status === 'pending' ? 'paid' : 'pending';
    if (state.user) {
      const { error } = await supabase
        .from('reminders')
        .update({ status: newStatus })
        .eq('id', reminder.id);

      if (!error) {
        setReminders(reminders.map(r => r.id === reminder.id ? { ...r, status: newStatus } : r));
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este recordatorio?')) {
      if (state.user) {
        const { error } = await supabase
          .from('reminders')
          .delete()
          .eq('id', id);

        if (!error) {
          setReminders(reminders.filter(r => r.id !== id));
        }
      }
    }
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Form */}
      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Bell size={22} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Nuevo Recordatorio de Pago</h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
            <label className="form-label">Descripción / Deuda</label>
            <input 
              type="text" 
              className="form-input" 
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              placeholder="Ej: Pagar Luz, Letra del carro..."
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
            <label className="form-label">Monto (S/)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-input" 
              value={form.amount}
              onChange={(e) => setForm({...form, amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Fecha de Vencimiento</label>
            <input 
              type="date" 
              className="form-input" 
              value={form.due_date}
              onChange={(e) => setForm({...form, due_date: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            <Plus size={16} /> Agregar
          </button>
        </form>
      </div>

      {/* List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Tus Recordatorios</h3>
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Cargando recordatorios...</p>
        ) : reminders.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
            <p>No tienes recordatorios pendientes. ¡Buen trabajo!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reminders.map(reminder => {
              const isPaid = reminder.status === 'paid';
              return (
                <div 
                  key={reminder.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '15px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: 'var(--bg-glass)',
                    opacity: isPaid ? 0.6 : 1,
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                      onClick={() => handleToggleStatus(reminder)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isPaid ? 'var(--success)' : 'var(--text-muted)',
                        background: isPaid ? 'var(--success)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                      }}
                    >
                      {isPaid && <Check size={14} />}
                    </button>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        textDecoration: isPaid ? 'line-through' : 'none',
                        color: isPaid ? 'var(--text-muted)' : 'var(--text-primary)'
                      }}>
                        {reminder.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} /> Vence el: {formatDate(reminder.due_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontWeight: '700', color: isPaid ? 'var(--text-muted)' : 'var(--danger)' }}>
                      {formatCurrency(reminder.amount)}
                    </div>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDelete(reminder.id)}
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

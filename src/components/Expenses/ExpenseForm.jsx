import { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { PAYMENT_METHODS } from '../../utils/categories';
import { getTodayStr } from '../../utils/formatters';
import { Save, X } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

export default function ExpenseForm() {
  const { state, dispatch } = useExpenses();
  const editing = state.editingExpense;

  const [form, setForm] = useState({
    amount: '', category: '', description: '', date: getTodayStr(), payment: 'efectivo', tipo_gasto: 'variable'
  });

  useEffect(() => {
    if (editing) {
      setForm({
        amount: String(editing.amount),
        category: editing.category,
        description: editing.description,
        date: editing.date,
        payment: editing.payment || 'efectivo',
        tipo_gasto: editing.tipo_gasto || 'variable'
      });
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;

    const expense = {
      ...form,
      amount: parseFloat(form.amount),
    };

    if (state.user) {
      if (editing) {
        const { error } = await supabase
          .from('expenses')
          .update(expense)
          .eq('id', editing.id);
        
        if (!error) {
          dispatch({ type: 'EDIT_EXPENSE', payload: { ...expense, id: editing.id } });
          dispatch({ type: 'SET_EDITING', payload: null });
        }
      } else {
        const { data, error } = await supabase
          .from('expenses')
          .insert([{ ...expense, user_id: state.user.id }])
          .select();
        
        if (!error && data) {
          dispatch({ type: 'ADD_EXPENSE', payload: data[0] });
        }
      }
    } else {
      // Fallback to local state if no user (should not happen usually)
      if (editing) {
        dispatch({ type: 'EDIT_EXPENSE', payload: { ...expense, id: editing.id } });
        dispatch({ type: 'SET_EDITING', payload: null });
      } else {
        dispatch({ type: 'ADD_EXPENSE', payload: expense });
      }
    }

    setForm({ amount: '', category: '', description: '', date: getTodayStr(), payment: 'efectivo', tipo_gasto: 'variable' });
    if (!editing) dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
  };

  const handleCancel = () => {
    dispatch({ type: 'SET_EDITING', payload: null });
    setForm({ amount: '', category: '', description: '', date: getTodayStr(), payment: 'efectivo', tipo_gasto: 'variable' });
  };

  return (
    <div className="expense-form-container fade-in-up">
      <div className="glass-card">
        <h3 className="modal-title">
          {editing ? '✏️ Editar Gasto' : '💸 Nuevo Gasto'}
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Tipo Gasto Selection */}
          <div className="form-group full" style={{ marginBottom: 20 }}>
            <label className="form-label">Tipo de Gasto *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div 
                className={`category-option ${form.tipo_gasto === 'fijo' ? 'selected' : ''}`}
                onClick={() => setForm(f => ({ ...f, tipo_gasto: 'fijo' }))}
                style={{ justifyContent: 'center', borderColor: form.tipo_gasto === 'fijo' ? 'var(--accent)' : 'var(--border-glass)', background: form.tipo_gasto === 'fijo' ? 'var(--accent-bg)' : 'transparent' }}
              >
                <span style={{ fontSize: '20px' }}>🏠</span>
                <span style={{ fontWeight: '600' }}>Gasto Fijo</span>
              </div>
              <div 
                className={`category-option ${form.tipo_gasto === 'variable' ? 'selected' : ''}`}
                onClick={() => setForm(f => ({ ...f, tipo_gasto: 'variable' }))}
                style={{ justifyContent: 'center', borderColor: form.tipo_gasto === 'variable' ? 'var(--violet)' : 'var(--border-glass)', background: form.tipo_gasto === 'variable' ? 'rgba(139, 92, 246, 0.1)' : 'transparent' }}
              >
                <span style={{ fontSize: '20px' }}>🛒</span>
                <span style={{ fontWeight: '600' }}>Gasto Variable</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
              {form.tipo_gasto === 'fijo' ? 'Recibos, alquiler, suscripciones, etc.' : 'Comidas, salidas, antojos, ropa, etc.'}
            </p>
          </div>
          {/* Category selection */}
          <div className="form-group full" style={{ marginBottom: 18 }}>
            <label className="form-label">Categoría *</label>
            <div className="category-grid">
              {state.categories.map(cat => (
                <div
                  key={cat.id}
                  className={`category-option ${form.category === cat.id ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  id={`cat-${cat.id}`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Monto (S/) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                id="input-amount"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha *</label>
              <input
                type="date"
                className="form-input"
                id="input-date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Método de pago</label>
              <select
                className="form-select"
                id="input-payment"
                value={form.payment}
                onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm.id} value={pm.id}>{pm.icon} {pm.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                className="form-input"
                id="input-description"
                placeholder="Ej: Almuerzo, Taxi..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="modal-actions">
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                <X size={16} /> Cancelar
              </button>
            )}
            <button type="submit" className="btn btn-primary" id="btn-save-expense">
              <Save size={16} /> {editing ? 'Guardar cambios' : 'Registrar gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useExpenses } from '../../context/ExpenseContext';
import { getPaymentById } from '../../utils/categories';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters';
import { Pencil, Trash2, Download } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function ExpenseList() {
  const { state, dispatch } = useExpenses();
  const { expenses, filters, categories } = state;

  const getCat = (id) => categories.find(c => c.id === id) || { name: 'Desconocido', icon: '❓', color: '#64748b' };

  const filtered = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    if (filters.category !== 'all' && e.category !== filters.category) return false;
    if (filters.payment !== 'all' && e.payment !== filters.payment) return false;
    if (d.getMonth() !== filters.month) return false;
    if (d.getFullYear() !== filters.year) return false;
    if (filters.day && d.getDate() !== parseInt(filters.day)) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleEdit = (expense) => {
    dispatch({ type: 'SET_EDITING', payload: expense });
    dispatch({ type: 'SET_VIEW', payload: 'add' });
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      if (state.user) {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
        
        if (!error) {
          dispatch({ type: 'DELETE_EXPENSE', payload: id });
        }
      } else {
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
      }
    }
  };

  const handleExportCSV = () => {
    const headers = 'Fecha,Categoría,Descripción,Monto,Método de Pago\n';
    const rows = filtered.map(e => {
      const cat = getCat(e.category);
      const pay = getPaymentById(e.payment);
      return `${e.date},${cat.name},"${e.description || ''}",${e.amount},${pay.name}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuenta_exacta_${filters.year}_${filters.month + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const years = [...new Set(expenses.map(e => new Date(e.date + 'T00:00:00').getFullYear()))];
  if (!years.includes(new Date().getFullYear())) years.push(new Date().getFullYear());
  years.sort((a, b) => b - a);

  return (
    <div className="fade-in-up">
      {/* Filter bar */}
      <div className="filter-bar">
        <select
          className="form-select"
          id="filter-month"
          value={filters.month}
          onChange={e => dispatch({ type: 'SET_FILTERS', payload: { month: parseInt(e.target.value) } })}
        >
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>

        <select
          className="form-select"
          id="filter-year"
          value={filters.year}
          onChange={e => dispatch({ type: 'SET_FILTERS', payload: { year: parseInt(e.target.value) } })}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          className="form-select"
          id="filter-category"
          value={filters.category}
          onChange={e => dispatch({ type: 'SET_FILTERS', payload: { category: e.target.value } })}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>

        <input
          type="number"
          className="form-input"
          id="filter-day"
          placeholder="Día"
          min="1"
          max="31"
          style={{ maxWidth: 90 }}
          value={filters.day}
          onChange={e => dispatch({ type: 'SET_FILTERS', payload: { day: e.target.value } })}
        />

        <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'RESET_FILTERS' })} id="btn-reset-filters">
          Limpiar
        </button>

        <div style={{ flex: 1 }} />

        <button className="btn btn-ghost btn-sm" onClick={handleExportCSV} id="btn-export">
          <Download size={14} /> CSV
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} gastos encontrados</span>
        <span style={{ fontWeight: 700, fontSize: 18 }}>Total: {formatCurrency(total)}</span>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Sin gastos registrados</h3>
            <p>No hay gastos para los filtros seleccionados. ¡Registra tu primer gasto!</p>
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'add' })}>
              Agregar gasto
            </button>
          </div>
        ) : (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Método</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(expense => {
                const cat = getCat(expense.category);
                const pay = getPaymentById(expense.payment);
                return (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.date)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className="cat-badge" style={{ borderLeft: `3px solid ${cat.color}` }}>
                          {cat.icon} {cat.name}
                        </span>
                        {expense.tipo_gasto === 'fijo' ? (
                          <span style={{ fontSize: '10px', background: 'var(--accent-bg)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>🏠 Fijo</span>
                        ) : (
                          <span style={{ fontSize: '10px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--violet)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>🛒 Variable</span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{expense.description || '—'}</td>
                    <td style={{ fontSize: 13 }}>{pay.icon} {pay.name}</td>
                    <td className="amount-cell" style={{ textAlign: 'right', color: 'var(--danger)' }}>
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon" onClick={() => handleEdit(expense)} title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(expense.id)} title="Eliminar" style={{ color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

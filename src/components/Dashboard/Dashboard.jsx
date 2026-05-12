import { useExpenses } from '../../context/ExpenseContext';
import { getCategoryById, CATEGORIES } from '../../utils/categories';
import { formatCurrency, getMonthName } from '../../utils/formatters';
import { TrendingDown, TrendingUp, DollarSign, Calendar, Tag, ArrowDownRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, Area, AreaChart
} from 'recharts';

export default function Dashboard() {
  const { state, dispatch } = useExpenses();
  const { expenses, filters } = state;
  const now = new Date();
  const curMonth = filters.month;
  const curYear = filters.year;

  // Current month expenses
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getMonth() === curMonth && d.getFullYear() === curYear;
  });

  // Previous month expenses
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
  const prevYear = curMonth === 0 ? curYear - 1 : curYear;
  const prevMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const totalCurrent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPrev = prevMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const changePercent = totalPrev > 0 ? ((totalCurrent - totalPrev) / totalPrev * 100) : 0;

  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const currentDay = (curYear === now.getFullYear() && curMonth === now.getMonth()) ? now.getDate() : daysInMonth;
  const dailyAvg = currentDay > 0 ? totalCurrent / currentDay : 0;

  // Top category
  const catTotals = {};
  monthExpenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const topCatId = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a])[0];
  const topCat = topCatId ? getCategoryById(topCatId) : null;

  // Category chart data
  const categoryData = CATEGORIES.map(c => ({
    name: c.icon + ' ' + c.name,
    value: catTotals[c.id] || 0,
    color: c.color,
    shortName: c.name,
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  // Pie data
  const pieData = categoryData.map(d => ({ name: d.shortName, value: d.value, color: d.color }));

  // Trend data (last 6 months)
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    let m = curMonth - i;
    let y = curYear;
    if (m < 0) { m += 12; y -= 1; }
    const mExpenses = expenses.filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getMonth() === m && d.getFullYear() === y;
    });
    trendData.push({
      name: getMonthName(m),
      total: mExpenses.reduce((s, e) => s + e.amount, 0),
    });
  }

  // Daily data for current month
  const dailyData = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayExpenses = monthExpenses.filter(e => new Date(e.date + 'T00:00:00').getDate() === d);
    dailyData.push({ day: d, total: dayExpenses.reduce((s, e) => s + e.amount, 0) });
  }

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const years = [...new Set(expenses.map(e => new Date(e.date + 'T00:00:00').getFullYear()))];
  if (!years.includes(now.getFullYear())) years.push(now.getFullYear());
  years.sort((a, b) => b - a);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Month/Year selector */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <select className="form-select" value={curMonth}
          onChange={e => dispatch({ type: 'SET_FILTERS', payload: { month: parseInt(e.target.value) } })}
        >
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className="form-select" value={curYear}
          onChange={e => dispatch({ type: 'SET_FILTERS', payload: { year: parseInt(e.target.value) } })}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="glass-card kpi-card accent fade-in-up">
          <div className="kpi-header">
            <span className="kpi-label">Gasto del mes</span>
            <div className="kpi-icon accent"><DollarSign size={20} /></div>
          </div>
          <div className="kpi-value">{formatCurrency(totalCurrent)}</div>
          <div className={`kpi-change ${changePercent <= 0 ? 'positive' : 'negative'}`}>
            {changePercent <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {Math.abs(changePercent).toFixed(1)}% vs mes anterior
          </div>
        </div>

        <div className="glass-card kpi-card success fade-in-up">
          <div className="kpi-header">
            <span className="kpi-label">Promedio diario</span>
            <div className="kpi-icon success"><Calendar size={20} /></div>
          </div>
          <div className="kpi-value">{formatCurrency(dailyAvg)}</div>
          <div className="kpi-change" style={{ color: 'var(--text-muted)' }}>
            {currentDay} días transcurridos
          </div>
        </div>

        <div className="glass-card kpi-card warning fade-in-up">
          <div className="kpi-header">
            <span className="kpi-label">Mayor categoría</span>
            <div className="kpi-icon warning"><Tag size={20} /></div>
          </div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {topCat ? `${topCat.icon} ${topCat.name}` : '—'}
          </div>
          <div className="kpi-change" style={{ color: 'var(--text-muted)' }}>
            {topCatId ? formatCurrency(catTotals[topCatId]) : 'Sin datos'}
          </div>
        </div>

        <div className="glass-card kpi-card danger fade-in-up">
          <div className="kpi-header">
            <span className="kpi-label">N° de gastos</span>
            <div className="kpi-icon danger"><ArrowDownRight size={20} /></div>
          </div>
          <div className="kpi-value">{monthExpenses.length}</div>
          <div className="kpi-change" style={{ color: 'var(--text-muted)' }}>
            registros este mes
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <div className="glass-card fade-in-up">
          <div className="chart-card-title"><div className="dot" /> Gastos por categoría</div>
          {categoryData.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No hay datos para este mes</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tickFormatter={v => `S/${v}`} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card fade-in-up">
          <div className="chart-card-title"><div className="dot" style={{ background: 'var(--violet)' }} /> Distribución</div>
          {pieData.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No hay datos</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  dataKey="value" paddingAngle={3} stroke="none">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="glass-card fade-in-up">
          <div className="chart-card-title"><div className="dot" style={{ background: 'var(--success)' }} /> Tendencia (6 meses)</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tickFormatter={v => `S/${v}`} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fill="url(#trendGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card fade-in-up">
          <div className="chart-card-title"><div className="dot" style={{ background: 'var(--warning)' }} /> Gasto diario</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={1} />
              <YAxis tickFormatter={v => `S/${v}`} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#8b5cf6" fillOpacity={0.7} radius={[3, 3, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent expenses */}
      <div className="glass-card fade-in-up" style={{ marginTop: 20 }}>
        <div className="chart-card-title" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="dot" style={{ background: 'var(--danger)' }} /> Últimos gastos</span>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'expenses' })}>
            Ver todos →
          </button>
        </div>
        {monthExpenses.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <p>No hay gastos registrados este mes.</p>
            <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'add' })}>
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
                <th style={{ textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {monthExpenses.slice(0, 5).map(e => {
                const cat = getCategoryById(e.category);
                return (
                  <tr key={e.id}>
                    <td style={{ fontSize: 13 }}>{new Date(e.date + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</td>
                    <td><span className="cat-badge" style={{ borderLeft: `3px solid ${cat.color}` }}>{cat.icon} {cat.name}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{e.description || '—'}</td>
                    <td className="amount-cell" style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatCurrency(e.amount)}</td>
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

import { useExpenses } from '../../context/ExpenseContext';
import { getCategoryById, CATEGORIES } from '../../utils/categories';
import { formatCurrency, getMonthName } from '../../utils/formatters';
import { Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { jsPDF } from 'jspdf';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function Reports() {
  const { state } = useExpenses();
  const { expenses, filters } = state;
  const curYear = filters.year;

  // Yearly summary
  const yearExpenses = expenses.filter(e => new Date(e.date + 'T00:00:00').getFullYear() === curYear);
  const yearTotal = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const monthlyAvg = yearTotal / 12;

  // Monthly comparison for the year
  const monthlyData = [];
  for (let m = 0; m < 12; m++) {
    const mExp = yearExpenses.filter(e => new Date(e.date + 'T00:00:00').getMonth() === m);
    monthlyData.push({ name: getMonthName(m), total: mExp.reduce((s, e) => s + e.amount, 0) });
  }

  // Top categories for the year
  const catTotals = {};
  yearExpenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const topCategories = Object.entries(catTotals)
    .map(([id, total]) => ({ ...getCategoryById(id), total }))
    .sort((a, b) => b.total - a.total);

  // Max month
  const maxMonth = monthlyData.reduce((max, m) => m.total > max.total ? m : max, { total: 0 });

  const handleExport = () => {
    const headers = 'Fecha,Categoría,Descripción,Monto,Método\n';
    const rows = yearExpenses.map(e => {
      const cat = getCategoryById(e.category);
      return `${e.date},${cat.name},"${e.description || ''}",${e.amount},${e.payment}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuenta_exacta_reporte_${curYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); // Indigo
    doc.text(`Cuenta Exacta - Reporte ${curYear}`, 14, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate
    doc.text(`Generado el ${new Date().toLocaleDateString()}`, 14, 28);
    
    // Summary
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Resumen General', 14, 45);
    
    doc.setFontSize(11);
    doc.text(`Gasto Total: ${formatCurrency(yearTotal)}`, 14, 55);
    doc.text(`Promedio Mensual: ${formatCurrency(monthlyAvg)}`, 14, 62);
    doc.text(`Total de Registros: ${yearExpenses.length}`, 14, 69);
    
    // Categories
    doc.setFontSize(14);
    doc.text('Gastos por Categoría', 14, 85);
    
    doc.setFontSize(11);
    let y = 95;
    topCategories.forEach(cat => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${cat.name}:`, 14, y);
      doc.text(`${formatCurrency(cat.total)}`, 70, y);
      y += 8;
    });
    
    doc.save(`cuenta_exacta_reporte_${curYear}.pdf`);
  };

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
    <div className="fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>📊 Reporte Anual {curYear}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleExport} id="btn-export-csv">
            <Download size={14} /> CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportPDF} id="btn-export-pdf">
            <FileText size={14} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="report-summary">
        <div className="glass-card report-item">
          <div className="value" style={{ color: 'var(--accent-light)' }}>{formatCurrency(yearTotal)}</div>
          <div className="label">Gasto total del año</div>
        </div>
        <div className="glass-card report-item">
          <div className="value" style={{ color: 'var(--success)' }}>{formatCurrency(monthlyAvg)}</div>
          <div className="label">Promedio mensual</div>
        </div>
        <div className="glass-card report-item">
          <div className="value" style={{ color: 'var(--warning)' }}>{yearExpenses.length}</div>
          <div className="label">Total de registros</div>
        </div>
      </div>

      {/* Monthly comparison chart */}
      <div className="glass-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-title"><div className="dot" /> Comparativa mensual {curYear}</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tickFormatter={v => `S/${v}`} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={28}>
              {monthlyData.map((entry, i) => (
                <Cell key={i} fill={entry.total === maxMonth.total ? '#6366f1' : '#8b5cf6'} fillOpacity={entry.total === maxMonth.total ? 1 : 0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top categories */}
      <div className="glass-card">
        <div className="chart-card-title"><div className="dot" style={{ background: 'var(--warning)' }} /> Top categorías del año</div>
        {topCategories.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <p>No hay datos para mostrar</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topCategories.map((cat, i) => {
              const pct = yearTotal > 0 ? (cat.total / yearTotal * 100) : 0;
              return (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{cat.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(cat.total)}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border-glass)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: cat.color,
                        borderRadius: 3,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 45, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

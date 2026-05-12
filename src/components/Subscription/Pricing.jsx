import { useState } from 'react';
import { Check, Star, Zap, X, MessageCircle } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

export default function Pricing() {
  const { dispatch } = useExpenses();
  const [modalPlan, setModalPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    if (plan === 'Free') {
      alert('¡Tu mes gratis ha sido activado!');
      dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
    } else {
      setModalPlan(plan);
    }
  };

  const getPlanPrice = (plan) => {
    if (plan === 'Mensual') return 'S/ 20';
    if (plan === 'Anual') return 'S/ 80';
    return '';
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>🎯 Elige el Plan Ideal para Ti</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Lleva el control de tus finanzas al siguiente nivel sin complicaciones.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Plan Free */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Plan Free</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Prueba la plataforma sin compromisos.</p>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800' }}>S/ 0</span>
              <span style={{ color: 'var(--text-muted)' }}> / mes</span>
            </div>
            <p style={{ color: 'var(--accent-light)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>🎁 ¡Primer mes gratis!</p>
            
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Registro de gastos diarios
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Dashboard básico
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <Check size={16} style={{ color: 'var(--text-muted)' }} /> Exportación a CSV (No disponible)
              </li>
            </ul>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: '30px', justifyContent: 'center' }} onClick={() => handleSelectPlan('Free')}>
            Empezar Gratis
          </button>
        </div>

        {/* Plan Mensual */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--accent)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Plan Mensual</h3>
              <Zap size={20} style={{ color: 'var(--warning)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Control total mes a mes.</p>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800' }}>S/ 20</span>
              <span style={{ color: 'var(--text-muted)' }}> / mes</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Todo lo del plan Free
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Dashboard premium con gráficos
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Exportación de datos ilimitada
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Filtros avanzados
              </li>
            </ul>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '30px', justifyContent: 'center' }} onClick={() => handleSelectPlan('Mensual')}>
            Suscribirse Mensual
          </button>
        </div>

        {/* Plan Anual */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))' }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            right: '20px',
            background: 'linear-gradient(135deg, var(--accent), var(--violet))',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700'
          }}>MEJOR VALOR</div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Plan Anual</h3>
              <Star size={20} style={{ color: 'var(--accent-light)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Ahorra en grande con el plan anual.</p>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800' }}>S/ 80</span>
              <span style={{ color: 'var(--text-muted)' }}> / año</span>
            </div>
            <p style={{ color: 'var(--success)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>💡 Equivale a S/ 6.66 al mes (Ahorras 66%)</p>
            
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Todo lo del plan Mensual
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Soporte prioritario
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Check size={16} style={{ color: 'var(--success)' }} /> Acceso anticipado a nuevas funciones
              </li>
            </ul>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '30px', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent), var(--violet))' }} onClick={() => handleSelectPlan('Anual')}>
            Suscribirse Anual
          </button>
        </div>
      </div>

      {/* Botón de Soporte WhatsApp */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a 
          href="https://wa.me/51950246159?text=Hola,%20necesito%20soporte%20con%20mi%20cuenta%20de%20Cuenta%20Exacta." 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#25D366' }}
        >
          <MessageCircle size={20} /> Soporte por WhatsApp
        </a>
      </div>

      {/* Modal de Pago (Yape) */}
      {modalPlan && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ 
            maxWidth: '400px', 
            width: '100%', 
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '25px', 
            position: 'relative',
            background: 'var(--bg-secondary)',
            textAlign: 'center'
          }}>
            <button 
              className="btn-icon" 
              style={{ position: 'absolute', top: '15px', right: '15px' }}
              onClick={() => setModalPlan(null)}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Pagar Plan {modalPlan}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Monto a pagar: <strong style={{ color: 'var(--text-primary)' }}>{getPlanPrice(modalPlan)}</strong>
            </p>

            {/* QR de Yape Real */}
            <div style={{
              width: '180px',
              height: '180px',
              margin: '0 auto 20px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(116, 24, 146, 0.3)',
              background: 'white',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/yape-qr.png" 
                alt="QR Yape" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div style="color: #666; font-size: 12px; padding: 10px;">Por favor, guarda la imagen como <strong>yape-qr.png</strong> en la carpeta <strong>public</strong></div>';
                }}
              />
            </div>

            <div style={{ textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-glass)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
              <p style={{ marginBottom: '8px' }}><strong>Pasos para activar tu plan:</strong></p>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <li>Escanea el código QR con tu app de Yape.</li>
                <li>Realiza el pago correspondiente.</li>
                <li>Envía la captura de pantalla (pantallazo) y el correo de tu cuenta al número <strong>+51 950246159</strong>.</li>
              </ol>
            </div>

            <a 
              href={`https://wa.me/51950246159?text=Hola,%20adjunto%20comprobante%20de%20pago%20para%20el%20Plan%20${modalPlan}.%20Mi%20correo%20es:%20`}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', background: '#25D366', border: 'none' }}
            >
              <MessageCircle size={18} /> Enviar Comprobante
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { LogIn, Mail, Lock, Chrome, Phone } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

export default function Login() {
  const { dispatch } = useExpenses();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (isSignUp) {
        if (!whatsapp.trim()) {
          setMessage({ text: 'Por favor, ingresa tu número de WhatsApp con código de país.', type: 'error' });
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { whatsapp: whatsapp.trim() }
          }
        });
        if (error) throw error;
        setMessage({ text: '¡Registro exitoso!', type: 'success' });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // El estado de auth cambiará y App lo detectará
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', animation: 'slideUp 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 16px', width: '60px', height: '60px', fontSize: '24px' }}>CE</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-light), var(--violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Cuenta Exacta
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {isSignUp ? 'Crea una cuenta para empezar' : 'Inicia sesión para continuar'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Número de WhatsApp (con código de país)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="+51 987654321"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {message.text && (
            <div style={{ 
              fontSize: '13px', 
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              padding: '10px',
              borderRadius: '6px'
            }}>
              {message.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
            <LogIn size={18} /> {loading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          O continúa con
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="btn btn-ghost" 
          style={{ width: '100%', justifyContent: 'center', gap: '10px', background: 'var(--bg-glass)' }}
        >
          <Chrome size={18} /> Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </span>{' '}
          <button 
            className="btn-link" 
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}

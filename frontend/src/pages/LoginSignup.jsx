import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import NeonBlobsBackground from '../components/NeonBlobsBackground';
import "./LoginSignup.css";

export default function LoginSignup({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');

  useEffect(() => {
    setIsLogin(initialMode !== 'signup');
  }, [initialMode]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    acceptedPolicy: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement Firebase auth
    console.log(isLogin ? 'Login' : 'Signup', formData);
    navigate('/login');
  };

  return (
    <div className="login-signup-container">
      <NeonBlobsBackground />
      <div className="login-signup-content">
        <div className="form-wrapper">
          <h1>{isLogin ? 'Conectare' : 'Înregistrare'}</h1>
          <p className="subtitle">{isLogin ? 'Introdu datele pentru a continua' : 'Completează formularul pentru a crea un cont'}</p>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Nume complet"
                aria-label="Nume complet"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            )}
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Parolă"
              aria-label="Parolă"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            {!isLogin && (
              <>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmă parola"
                  aria-label="Confirmă parola"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                />

                <label className="policy-label" style={{display:'flex', alignItems:'center', gap:10, fontSize:14}}>
                  <input
                    type="checkbox"
                    name="acceptedPolicy"
                    checked={formData.acceptedPolicy}
                    onChange={handleChange}
                    required={!isLogin}
                    style={{width:18, height:18}}
                  />
                  <span>
                    Sunt de acord cu <Link to="/privacy-policy" style={{color:'rgba(59,130,246,0.95)', textDecoration:'underline'}}>Politica de confidențialitate</Link>
                  </span>
                </label>
              </>
            )}
            
            <Button type="submit" disabled={!isLogin && !formData.acceptedPolicy}>{isLogin ? 'Conectare' : 'Înregistrare'}</Button>
          </form>

          <p className="toggle-text">
            {isLogin ? 'Nu ai cont?' : 'Ai deja cont?'}
            <button
              type="button"
              onClick={() => {
                // Navigate to the corresponding route so URL reflects mode
                navigate(isLogin ? '/signup' : '/login');
                setFormData({ email: '', password: '', name: '', confirmPassword: '' });
              }}
              className="toggle-btn"
            >
              {isLogin ? 'Înregistrează-te' : 'Conectează-te'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import NeonBlobsBackground from '../components/NeonBlobsBackground';
import ChooseCategoryModal from '../components/ChooseCategoryModal';
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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleSubmit = (e) => {
    // Login submit
    e.preventDefault();

    // Basic client-side validation for login
    const newErrors = {};

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Introduceți o adresă de email validă.';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Parola trebuie să aibă cel puțin 6 caractere.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // TODO: Implement Firebase auth
    console.log('login submit');
    const userObj = { name: formData.name || formData.email, email: formData.email };
    localStorage.setItem('user', JSON.stringify(userObj));
    navigate('/login');
  };

  const handleSignup = (e) => {
    console.log('signup submit');
    e.preventDefault();

    // Validation for signup
    const newErrors = {};

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Introduceți o adresă de email validă.';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Parola trebuie să aibă cel puțin 6 caractere.';
    }

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Introduceți numele complet.';
    }

    if (!formData.confirmPassword || formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Confirmarea parolei nu corespunde.';
    }

    if (!formData.acceptedPolicy) {
      newErrors.acceptedPolicy = 'Trebuie să acceptați politica de confidențialitate.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Simulate signup: persist basic user info and open category modal
    const userObj = { name: formData.name || formData.email, email: formData.email };
    localStorage.setItem('user', JSON.stringify(userObj));
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="login-signup-container">
      <NeonBlobsBackground />
      <div className="login-signup-content">
        <div className="form-wrapper">
          <h1>{isLogin ? 'Conectare' : 'Înregistrare'}</h1>
          <p className="subtitle">{isLogin ? 'Introdu datele pentru a continua' : 'Completează formularul pentru a crea un cont'}</p>
          <form onSubmit={isLogin ? handleSubmit : handleSignup}>
            {!isLogin && (
              <>
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
                {errors.name && <div className="input-error">{errors.name}</div>}
              </>
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
            {errors.email && <div className="input-error">{errors.email}</div>}
            
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
            {errors.password && <div className="input-error">{errors.password}</div>}
            
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
                {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}

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
                {errors.acceptedPolicy && <div className="input-error">{errors.acceptedPolicy}</div>}
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

          <p className="privacy-link-bottom">
            <Link to="/privacy-policy" className="privacy-bottom-link">Politica de confidențialitate</Link>
          </p>
        </div>
      </div>

      <ChooseCategoryModal open={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />
    </div>
  );
}
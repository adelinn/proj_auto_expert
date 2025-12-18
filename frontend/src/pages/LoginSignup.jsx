import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import NeonBlobsBackground from '../components/NeonBlobsBackground';

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement Firebase auth
    console.log(isLogin ? 'Login' : 'Signup', formData);
    navigate('/');
  };

  return (
    <div className="login-signup-container">
      <NeonBlobsBackground />
      <div className="login-signup-content">
        <div className="form-wrapper">
          <h1>{isLogin ? 'Conectare' : 'Înregistrare'}</h1>
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Nume complet"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            )}
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Parolă"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmă parola"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
              />
            )}
            
            <Button>{isLogin ? 'Conectare' : 'Înregistrare'}</Button>
          </form>

          <p className="toggle-text">
            {isLogin ? 'Nu ai cont?' : 'Ai deja cont?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
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
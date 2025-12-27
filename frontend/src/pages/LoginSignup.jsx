import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import { setToken } from '../utils/token';
import { useAuth } from '../hooks/useAuth';
import "./LoginSignup.css";

export default function LoginSignup({ initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode !== "signup");

  useEffect(() => {
    setIsLogin(initialMode !== "signup");
  }, [initialMode]);

  const initialFormData = useMemo(
    () => ({
      email: "",
      password: "",
      name: "", // used as username on signup
      confirmPassword: "",
      acceptedPolicy: false,
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const shouldNavigateRef = useRef(false);

  const navigate = useNavigate();
  const { refreshAuth, isAuthenticated } = useAuth();

  // Navigate when authentication state becomes true after login/signup
  useEffect(() => {
    if (shouldNavigateRef.current && isAuthenticated) {
      shouldNavigateRef.current = false;
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    // Login submit
    e.preventDefault();

    // Basic client-side validation for login
    const newErrors = {};

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Parolele nu se potrivesc.";
      }
      if (!formData.acceptedPolicy) {
        newErrors.acceptedPolicy =
          "Trebuie să accepți politica de confidențialitate.";
      }
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name =
          "Introduceți numele. Trebuie sa aiva mai mult de 2 caractere.";
      }
    }

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Introduceți o adresă de email validă.";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Parola trebuie să aibă cel puțin 6 caractere.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const apiBase = (
      import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000/api"
    ).replace(/\/+$/, "");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const url = `${apiBase}${endpoint}`;

    // User requirement: /auth/login needs email+password; /register needs username+password.
    // Backend in this repo uses email+password; we send username too (ignored if backend doesn't need it).
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          email: formData.email,
          username: formData.name,
          password: formData.password,
        };

    setIsSubmitting(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => "");
        data = text ? { message: text } : {};
      }

      if (!res.ok) {
        throw new Error(data?.msg || data?.message || "Cererea a eșuat.");
      }

      const token = data?.token || data?.data?.token;
      if (!token) {
        throw new Error("Răspuns invalid: token lipsă.");
      }

      // Set token and refresh auth state
      setToken(token);
      refreshAuth();
      
      // Mark that we should navigate once auth state updates
      shouldNavigateRef.current = true;
    } catch (err) {
      setErrors({ message: err?.message || "A apărut o eroare. Încearcă din nou." });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-signup-container">
      <div className="login-signup-content">
        <div className="form-wrapper">
          <h1>{isLogin ? "Conectare" : "Înregistrare"}</h1>
          <p className="subtitle">
            {isLogin
              ? "Introdu datele pentru a continua"
              : "Completează formularul pentru a crea un cont"}
          </p>
          {errors.message ? (
            <p
              style={{
                marginTop: 12,
                color: "rgba(239, 68, 68, 0.95)",
                fontSize: 14,
              }}
            >
              {errors.message}
            </p>
          ) : null}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Nume de utilizator"
                aria-label="Nume de utilizator"
                autoComplete="username"
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
            {errors.email && <div className="input-error">{errors.email}</div>}

            <input
              type="password"
              name="password"
              placeholder="Parolă"
              aria-label="Parolă"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <div className="input-error">{errors.password}</div>
            )}

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
                {errors.confirmPassword && (
                  <div className="input-error">{errors.confirmPassword}</div>
                )}

                <label
                  className="policy-label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    name="acceptedPolicy"
                    checked={formData.acceptedPolicy}
                    onChange={handleChange}
                    required={!isLogin}
                    style={{ width: 18, height: 18 }}
                  />
                  <span>
                    Sunt de acord cu{" "}
                    <Link
                      to="/privacy-policy"
                      style={{
                        color: "rgba(59,130,246,0.95)",
                        textDecoration: "underline",
                      }}
                    >
                      Politica de confidențialitate
                    </Link>
                  </span>
                </label>
                {errors.acceptedPolicy && (
                  <div className="input-error">{errors.acceptedPolicy}</div>
                )}
              </>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || (!isLogin && !formData.acceptedPolicy)}
            >
              {isSubmitting
                ? "Se procesează..."
                : isLogin
                ? "Conectare"
                : "Înregistrare"}
            </Button>
          </form>

          <p className="toggle-text">
            {isLogin ? "Nu ai cont?" : "Ai deja cont?"}
            <button
              type="button"
              onClick={() => {
                // Navigate to the corresponding route so URL reflects mode
                navigate(isLogin ? "/signup" : "/login");
                setErrors({});
                setFormData(initialFormData);
              }}
              className="toggle-btn"
            >
              {isLogin ? "Înregistrează-te" : "Conectează-te"}
            </button>
          </p>

          {isLogin && (
            <p className="privacy-link-bottom">
              <Link to="/privacy-policy" className="privacy-bottom-link">
                Politica de confidențialitate
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

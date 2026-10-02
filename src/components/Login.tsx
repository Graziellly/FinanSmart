import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaChartLine,
} from "react-icons/fa6";

interface LoginProps {
  onRegister: () => void;
}

function Login({ onRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Preencha seu e-mail e sua senha."
      );
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (firebaseError) {
      console.error(firebaseError);

      setError(
        "E-mail ou senha incorretos. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <FaChartLine />
            </div>

            <span>FinanSmart</span>
          </div>

          <div className="auth-brand-text">
            <span className="auth-eyebrow">
              Controle financeiro inteligente
            </span>

            <h1>
              Organize suas finanças de forma
              simples e inteligente.
            </h1>

            <p>
              Acompanhe seus gastos, defina
              orçamentos e alcance suas metas em
              um só lugar.
            </p>
          </div>

          <div className="auth-brand-footer">
            FinanSmart • Gestão financeira pessoal
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <div className="auth-logo-icon">
              <FaChartLine />
            </div>

            <span>FinanSmart</span>
          </div>

          <div className="auth-form-heading">
            <span>Bem-vindo de volta</span>

            <h2>Entre na sua conta</h2>

            <p>
              Informe seus dados para acessar seu
              painel financeiro.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleLogin}
          >
            <div className="auth-field">
              <label htmlFor="login-email">
                E-mail
              </label>

              <div className="auth-input-wrapper">
                <FaEnvelope />

                <input
                  id="login-email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">
                  Senha
                </label>
              </div>

              <div className="auth-input-wrapper">
                <FaLock />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? "Entrando..."
                : "Entrar"}
            </button>
          </form>

          <div className="auth-register">
            <span>
              Ainda não possui uma conta?
            </span>

            <button
              type="button"
              onClick={onRegister}
            >
              Criar conta
            </button>
          </div>

          <div className="auth-security">
            Seus dados são protegidos pelo Firebase
            Authentication.
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
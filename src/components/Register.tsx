import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "../firebase";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaChartLine,
} from "react-icons/fa6";

interface RegisterProps {
  onLogin: () => void;
}

function Register({ onLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Preencha todos os campos."
      );

      return;
    }

    if (password.length < 6) {
      setError(
        "A senha precisa ter pelo menos 6 caracteres."
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        "As senhas não são iguais."
      );

      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await updateProfile(
        userCredential.user,
        {
          displayName: name.trim(),
        }
      );
    } catch (firebaseError: unknown) {
      console.error(firebaseError);

      const firebaseCode =
        typeof firebaseError === "object" &&
        firebaseError !== null &&
        "code" in firebaseError
          ? String(
              (
                firebaseError as {
                  code: unknown;
                }
              ).code
            )
          : "";

      if (
        firebaseCode ===
        "auth/email-already-in-use"
      ) {
        setError(
          "Este e-mail já possui uma conta. Faça login."
        );
      } else if (
        firebaseCode ===
        "auth/invalid-email"
      ) {
        setError(
          "Digite um endereço de e-mail válido."
        );
      } else if (
        firebaseCode ===
        "auth/weak-password"
      ) {
        setError(
          "Escolha uma senha mais segura."
        );
      } else {
        setError(
          "Não foi possível criar sua conta. Tente novamente."
        );
      }
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
              Sua vida financeira organizada
            </span>

            <h1>
              Comece hoje a cuidar melhor do seu
              dinheiro.
            </h1>

            <p>
              Controle receitas e despesas, crie
              orçamentos e acompanhe suas metas em
              um único painel.
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
            <span>Comece agora</span>

            <h2>Crie sua conta</h2>

            <p>
              Preencha seus dados para começar a
              usar o FinanSmart.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleRegister}
          >
            <div className="auth-field">
              <label htmlFor="register-name">
                Nome
              </label>

              <div className="auth-input-wrapper">
                <FaUser />

                <input
                  id="register-name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">
                E-mail
              </label>

              <div className="auth-input-wrapper">
                <FaEnvelope />

                <input
                  id="register-email"
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
              <label htmlFor="register-password">
                Senha
              </label>

              <div className="auth-input-wrapper">
                <FaLock />

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label="Mostrar ou ocultar senha"
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-password">
                Confirmar senha
              </label>

              <div className="auth-input-wrapper">
                <FaLock />

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Digite sua senha novamente"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  aria-label="Mostrar ou ocultar senha"
                >
                  {showConfirmPassword ? (
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
                ? "Criando conta..."
                : "Criar minha conta"}
            </button>
          </form>

          <div className="auth-register">
            <span>
              Já possui uma conta?
            </span>

            <button
              type="button"
              onClick={onLogin}
            >
              Fazer login
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

export default Register;
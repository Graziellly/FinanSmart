import { useState } from "react";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import { auth } from "../firebase";

import {
  FaUser,
  FaEnvelope,
  FaWallet,
  FaPen,
  FaCheck,
  FaXmark,
  FaShieldHalved,
  FaRightFromBracket,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa6";

interface SettingsProps {
  userName?: string | null;
  userEmail?: string | null;
  initialBalance: number;
  onUpdateName: (name: string) => Promise<void>;
  onUpdateInitialBalance: (balance: number) => void;
  onLogout: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function Settings({
  userName,
  userEmail,
  initialBalance,
  onUpdateName,
  onUpdateInitialBalance,
  onLogout,
}: SettingsProps) {
  const [editingName, setEditingName] =
    useState(false);

  const [editingBalance, setEditingBalance] =
    useState(false);

  const [name, setName] =
    useState(userName || "");

  const [balanceValue, setBalanceValue] =
    useState(String(initialBalance));

  const [savingName, setSavingName] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [editingPassword, setEditingPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const displayName =
    userName?.trim() ||
    userEmail?.split("@")[0] ||
    "Usuário";

  const nameParts = displayName
    .split(" ")
    .filter(Boolean);

  const initials =
    nameParts.length > 1
      ? (
          nameParts[0][0] +
          nameParts[nameParts.length - 1][0]
        ).toUpperCase()
      : displayName
          .substring(0, 2)
          .toUpperCase();

  /* =========================
     ATUALIZAR NOME
  ========================= */

  async function handleSaveName() {
    const cleanName = name.trim();

    if (!cleanName) {
      setMessage(
        "Digite um nome válido."
      );
      return;
    }

    try {
      setSavingName(true);

      await onUpdateName(cleanName);

      setEditingName(false);

      setMessage(
        "Nome atualizado com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar nome:",
        error
      );

      setMessage(
        "Não foi possível atualizar o nome."
      );
    } finally {
      setSavingName(false);
    }
  }

  /* =========================
     ATUALIZAR SALDO INICIAL
  ========================= */

  function handleSaveBalance() {
    const value = Number(
      balanceValue
        .replace(",", ".")
        .trim()
    );

    if (
      Number.isNaN(value) ||
      value < 0
    ) {
      setMessage(
        "Digite um saldo inicial válido."
      );
      return;
    }

    onUpdateInitialBalance(value);

    setEditingBalance(false);

    setMessage(
      "Saldo inicial atualizado com sucesso."
    );
  }

  function cancelNameEditing() {
    setName(userName || "");
    setEditingName(false);
    setMessage("");
  }

  function cancelBalanceEditing() {
    setBalanceValue(
      String(initialBalance)
    );

    setEditingBalance(false);
    setMessage("");
  }

  /* =========================
     ALTERAR SENHA
  ========================= */

  async function handleChangePassword() {
    setMessage("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setMessage(
        "Preencha todos os campos de senha."
      );
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "A nova senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setMessage(
        "A nova senha e a confirmação não são iguais."
      );
      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setMessage(
        "A nova senha deve ser diferente da senha atual."
      );
      return;
    }

    const user = auth.currentUser;

    if (!user || !user.email) {
      setMessage(
        "Não foi possível identificar sua conta."
      );
      return;
    }

    try {
      setSavingPassword(true);

      const credential =
        EmailAuthProvider.credential(
          user.email,
          currentPassword
        );

      await reauthenticateWithCredential(
        user,
        credential
      );

      await updatePassword(
        user,
        newPassword
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setEditingPassword(false);

      setMessage(
        "Senha alterada com sucesso."
      );
    } catch (error: unknown) {
      console.error(
        "Erro ao alterar senha:",
        error
      );

      const firebaseError =
        error as {
          code?: string;
        };

      if (
        firebaseError.code ===
          "auth/invalid-credential" ||
        firebaseError.code ===
          "auth/wrong-password"
      ) {
        setMessage(
          "A senha atual está incorreta."
        );
      } else if (
        firebaseError.code ===
        "auth/weak-password"
      ) {
        setMessage(
          "A nova senha é muito fraca."
        );
      } else if (
        firebaseError.code ===
        "auth/too-many-requests"
      ) {
        setMessage(
          "Muitas tentativas. Aguarde um pouco e tente novamente."
        );
      } else {
        setMessage(
          "Não foi possível alterar a senha. Tente novamente."
        );
      }
    } finally {
      setSavingPassword(false);
    }
  }

  function cancelPasswordEditing() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setEditingPassword(false);
    setMessage("");
  }

  /* =========================
     SAIR
  ========================= */

  return (
    <main className="settings-page">
      {/* CABEÇALHO */}

      <header className="settings-header">
        <div>
          <h1>Configurações</h1>

          <p>
            Gerencie seus dados pessoais e
            preferências da conta.
          </p>
        </div>
      </header>

      {/* MENSAGEM */}

      {message && (
        <div className="settings-message">
          <FaCheck />

          <span>{message}</span>
        </div>
      )}

      <section className="settings-grid">
        {/* PERFIL */}

        <article className="settings-card settings-profile-card">
          <div className="settings-profile">
            <div className="settings-profile-avatar">
              {initials}
            </div>

            <div>
              <h2>{displayName}</h2>

              <p>
                {userEmail ||
                  "E-mail não disponível"}
              </p>
            </div>
          </div>
        </article>

        {/* DADOS PESSOAIS */}

        <article className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FaUser />
            </div>

            <div>
              <h2>Dados pessoais</h2>

              <p>
                Informações da sua conta.
              </p>
            </div>
          </div>

          {/* NOME */}

          <div className="settings-field">
            <div className="settings-field-info">
              <span>Nome</span>

              {!editingName ? (
                <strong>
                  {displayName}
                </strong>
              ) : (
                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Seu nome"
                  autoFocus
                />
              )}
            </div>

            {!editingName ? (
              <button
                type="button"
                className="settings-edit-button"
                onClick={() => {
                  setName(
                    userName || ""
                  );

                  setEditingName(true);
                  setMessage("");
                }}
              >
                <FaPen />
                Editar
              </button>
            ) : (
              <div className="settings-actions">
                <button
                  type="button"
                  className="settings-save-button"
                  onClick={
                    handleSaveName
                  }
                  disabled={savingName}
                >
                  <FaCheck />

                  {savingName
                    ? "Salvando..."
                    : "Salvar"}
                </button>

                <button
                  type="button"
                  className="settings-cancel-button"
                  onClick={
                    cancelNameEditing
                  }
                  disabled={savingName}
                  aria-label="Cancelar edição do nome"
                >
                  <FaXmark />
                </button>
              </div>
            )}
          </div>

          {/* E-MAIL */}

          <div className="settings-field">
            <div className="settings-field-info">
              <span>E-mail</span>

              <strong>
                {userEmail ||
                  "Não disponível"}
              </strong>
            </div>

            <FaEnvelope className="settings-field-icon" />
          </div>
        </article>

        {/* SALDO INICIAL */}

        <article className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FaWallet />
            </div>

            <div>
              <h2>Saldo inicial</h2>

              <p>
                Valor disponível antes das
                movimentações cadastradas.
              </p>
            </div>
          </div>

          <div className="settings-balance-box">
            {!editingBalance ? (
              <>
                <div>
                  <span>
                    Saldo inicial atual
                  </span>

                  <strong>
                    {formatCurrency(
                      initialBalance
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="settings-edit-button"
                  onClick={() => {
                    setBalanceValue(
                      String(
                        initialBalance
                      )
                    );

                    setEditingBalance(
                      true
                    );

                    setMessage("");
                  }}
                >
                  <FaPen />
                  Alterar
                </button>
              </>
            ) : (
              <>
                <div className="settings-balance-input">
                  <span>
                    Novo saldo inicial
                  </span>

                  <div>
                    <span>R$</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        balanceValue
                      }
                      onChange={(
                        event
                      ) =>
                        setBalanceValue(
                          event.target
                            .value
                        )
                      }
                      autoFocus
                    />
                  </div>
                </div>

                <div className="settings-actions">
                  <button
                    type="button"
                    className="settings-save-button"
                    onClick={
                      handleSaveBalance
                    }
                  >
                    <FaCheck />
                    Salvar
                  </button>

                  <button
                    type="button"
                    className="settings-cancel-button"
                    onClick={
                      cancelBalanceEditing
                    }
                    aria-label="Cancelar alteração do saldo"
                  >
                    <FaXmark />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="settings-warning">
            Alterar o saldo inicial modifica
            o cálculo do seu saldo disponível,
            mas não altera suas transações.
          </div>
        </article>

        {/* CONTA E SEGURANÇA */}

        <article className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <FaShieldHalved />
            </div>

            <div>
              <h2>
                Conta e segurança
              </h2>

              <p>
                Gerencie a segurança da
                sua conta.
              </p>
            </div>
          </div>

          <div className="settings-security-item">
            <FaShieldHalved />

            <div>
              <strong>
                Conta protegida
              </strong>

              <span>
                Seu acesso é autenticado
                pelo Firebase
                Authentication.
              </span>
            </div>
          </div>

          {/* ALTERAR SENHA */}

          {!editingPassword ? (
            <div className="settings-password-option">
              <div className="settings-password-info">
                <div className="settings-password-icon">
                  <FaLock />
                </div>

                <div>
                  <strong>
                    Senha
                  </strong>

                  <span>
                    Altere sua senha de
                    acesso ao FinanSmart.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="settings-edit-button"
                onClick={() => {
                  setEditingPassword(
                    true
                  );

                  setMessage("");
                }}
              >
                <FaPen />
                Alterar senha
              </button>
            </div>
          ) : (
            <div className="settings-password-form">
              {/* SENHA ATUAL */}

              <div className="settings-password-field">
                <label>
                  Senha atual
                </label>

                <div className="settings-password-input">
                  <FaLock />

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      currentPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setCurrentPassword(
                        event.target
                          .value
                      )
                    }
                    placeholder="Digite sua senha atual"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (
                          current
                        ) => !current
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Ocultar senha atual"
                        : "Mostrar senha atual"
                    }
                  >
                    {showCurrentPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* NOVA SENHA */}

              <div className="settings-password-field">
                <label>
                  Nova senha
                </label>

                <div className="settings-password-input">
                  <FaLock />

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      newPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setNewPassword(
                        event.target
                          .value
                      )
                    }
                    placeholder="Mínimo de 6 caracteres"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (
                          current
                        ) => !current
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Ocultar nova senha"
                        : "Mostrar nova senha"
                    }
                  >
                    {showNewPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRMAR SENHA */}

              <div className="settings-password-field">
                <label>
                  Confirmar nova senha
                </label>

                <div className="settings-password-input">
                  <FaLock />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value
                      )
                    }
                    placeholder="Digite novamente"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (
                          current
                        ) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmação"
                        : "Mostrar confirmação"
                    }
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* AÇÕES */}

              <div className="settings-password-actions">
                <button
                  type="button"
                  className="settings-save-button"
                  onClick={
                    handleChangePassword
                  }
                  disabled={
                    savingPassword
                  }
                >
                  <FaCheck />

                  {savingPassword
                    ? "Alterando..."
                    : "Salvar nova senha"}
                </button>

                <button
                  type="button"
                  className="settings-cancel-password"
                  onClick={
                    cancelPasswordEditing
                  }
                  disabled={
                    savingPassword
                  }
                >
                  <FaXmark />
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </article>

        {/* SAIR DA CONTA */}

        <article className="settings-card settings-logout-card">
          <div>
            <h2>Sair da conta</h2>

            <p>
              Encerre sua sessão neste
              dispositivo.
            </p>
          </div>

          <button
  type="button"
  className="settings-logout-button"
  onClick={onLogout}
>
  <FaRightFromBracket />
  Sair
</button>
        </article>
      </section>
    </main>
  );
}

export default Settings;
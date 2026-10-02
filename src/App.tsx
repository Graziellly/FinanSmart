import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import {
  FaArrowRightFromBracket,
  FaXmark,
} from "react-icons/fa6";

import "./App.css";

import { auth } from "./firebase";

import Sidebar, {
  type Page,
} from "./components/Sidebar";

import Dashboard from "./components/Dashboard";

import Transactions, {
  type Transaction,
} from "./components/Transactions";

import TransactionModal, {
  type TransactionFormData,
} from "./components/TransactionModal";

import Budgets from "./components/Budgets";
import Goals from "./components/Goals";
import Reports from "./components/Reports";
import Assistant from "./components/Assistant";
import Settings from "./components/Settings";
import Login from "./components/Login";
import Register from "./components/Register";
import InitialBalance from "./components/InitialBalance";

function App() {
  /* =========================
     AUTENTICAÇÃO
  ========================= */

  const [user, setUser] =
    useState<User | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [authScreen, setAuthScreen] =
    useState<"login" | "register">(
      "login"
    );

  /* =========================
     PÁGINA ATUAL
  ========================= */

  const [currentPage, setCurrentPage] =
    useState<Page>("dashboard");

  /* =========================
     SALDO INICIAL
  ========================= */

  const [
    initialBalance,
    setInitialBalance,
  ] = useState(0);

  const [
    initialBalanceConfigured,
    setInitialBalanceConfigured,
  ] = useState(false);

  const [
    userDataLoaded,
    setUserDataLoaded,
  ] = useState(false);

  /* =========================
     MODAL DE TRANSAÇÃO
  ========================= */

  const [
    isTransactionModalOpen,
    setIsTransactionModalOpen,
  ] = useState(false);

  /* =========================
     TRANSAÇÃO EM EDIÇÃO
  ========================= */

  const [
    editingTransaction,
    setEditingTransaction,
  ] = useState<Transaction | null>(
    null
  );

  /* =========================
     MODAL DE LOGOUT
  ========================= */

  const [
    isLogoutModalOpen,
    setIsLogoutModalOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  /* =========================
     TRANSAÇÕES
  ========================= */

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  /* =========================
     OBSERVAR LOGIN
  ========================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(firebaseUser);
          setAuthLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  /* =========================
     CARREGAR DADOS
  ========================= */

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setInitialBalance(0);
      setInitialBalanceConfigured(
        false
      );
      setUserDataLoaded(false);

      return;
    }

    setUserDataLoaded(false);

    /* TRANSAÇÕES */

    const transactionsKey =
      `finansmart-transactions-${user.uid}`;

    const savedTransactions =
      localStorage.getItem(
        transactionsKey
      );

    if (savedTransactions) {
      try {
        const parsedTransactions =
          JSON.parse(
            savedTransactions
          );

        setTransactions(
          Array.isArray(
            parsedTransactions
          )
            ? parsedTransactions
            : []
        );
      } catch {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }

    /* SALDO INICIAL */

    const balanceKey =
      `finansmart-initial-balance-${user.uid}`;

    const savedBalance =
      localStorage.getItem(
        balanceKey
      );

    if (savedBalance !== null) {
      const parsedBalance =
        Number(savedBalance);

      if (
        !Number.isNaN(
          parsedBalance
        )
      ) {
        setInitialBalance(
          parsedBalance
        );

        setInitialBalanceConfigured(
          true
        );
      } else {
        setInitialBalance(0);

        setInitialBalanceConfigured(
          false
        );
      }
    } else {
      setInitialBalance(0);

      setInitialBalanceConfigured(
        false
      );
    }

    setUserDataLoaded(true);
  }, [user]);

  /* =========================
     SALVAR TRANSAÇÕES
  ========================= */

  useEffect(() => {
    if (
      !user ||
      !userDataLoaded
    ) {
      return;
    }

    const storageKey =
      `finansmart-transactions-${user.uid}`;

    localStorage.setItem(
      storageKey,
      JSON.stringify(
        transactions
      )
    );
  }, [
    transactions,
    user,
    userDataLoaded,
  ]);

  /* =========================
     SALVAR SALDO INICIAL
  ========================= */

  function handleInitialBalance(
    balance: number
  ) {
    if (!user) {
      return;
    }

    const balanceKey =
      `finansmart-initial-balance-${user.uid}`;

    localStorage.setItem(
      balanceKey,
      String(balance)
    );

    setInitialBalance(balance);

    setInitialBalanceConfigured(
      true
    );
  }

  /* =========================
     SALVAR / EDITAR TRANSAÇÃO
  ========================= */

  function handleSaveTransaction(
    transaction: TransactionFormData
  ) {
    if (editingTransaction) {
      setTransactions(
        (currentTransactions) =>
          currentTransactions.map(
            (
              currentTransaction
            ) =>
              currentTransaction.id ===
              editingTransaction.id
                ? {
                    ...currentTransaction,
                    ...transaction,
                  }
                : currentTransaction
          )
      );

      setEditingTransaction(null);

      return;
    }

    const newTransaction: Transaction =
      {
        ...transaction,
        id: Date.now(),
      };

    setTransactions(
      (currentTransactions) => [
        newTransaction,
        ...currentTransactions,
      ]
    );
  }

  /* =========================
     EXCLUIR TRANSAÇÃO
  ========================= */

  function handleDeleteTransaction(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Deseja realmente excluir esta transação?"
      );

    if (!confirmed) {
      return;
    }

    setTransactions(
      (currentTransactions) =>
        currentTransactions.filter(
          (transaction) =>
            transaction.id !== id
        )
    );
  }

  /* =========================
     NOVA TRANSAÇÃO
  ========================= */

  function openTransactionModal() {
    setEditingTransaction(null);

    setIsTransactionModalOpen(
      true
    );
  }

  /* =========================
     EDITAR TRANSAÇÃO
  ========================= */

  function handleEditTransaction(
    transaction: Transaction
  ) {
    setEditingTransaction(
      transaction
    );

    setIsTransactionModalOpen(
      true
    );
  }

  /* =========================
     FECHAR MODAL
  ========================= */

  function closeTransactionModal() {
    setIsTransactionModalOpen(
      false
    );

    setEditingTransaction(null);
  }

  /* =========================
     ATUALIZAR NOME
  ========================= */

  async function handleUpdateName(
    name: string
  ) {
    if (!auth.currentUser) {
      return;
    }

    await updateProfile(
      auth.currentUser,
      {
        displayName: name,
      }
    );

    setUser({
      ...auth.currentUser,
    });
  }

  /* =========================
     ABRIR LOGOUT
  ========================= */

  function openLogoutModal() {
    setIsLogoutModalOpen(true);
  }

  function closeLogoutModal() {
    if (isLoggingOut) {
      return;
    }

    setIsLogoutModalOpen(false);
  }

  /* =========================
     SAIR DA CONTA
  ========================= */

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await signOut(auth);

      setTransactions([]);

      setInitialBalance(0);

      setInitialBalanceConfigured(
        false
      );

      setUserDataLoaded(false);

      setCurrentPage(
        "dashboard"
      );

      setAuthScreen("login");

      setEditingTransaction(
        null
      );

      setIsTransactionModalOpen(
        false
      );

      setIsLogoutModalOpen(
        false
      );
    } catch (error) {
      console.error(
        "Erro ao sair da conta:",
        error
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  /* =========================
     CARREGANDO FIREBASE
  ========================= */

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-logo">
          FinanSmart
        </div>

        <div className="auth-loading-spinner" />

        <span>
          Carregando sua conta...
        </span>
      </div>
    );
  }

  /* =========================
     NÃO AUTENTICADO
  ========================= */

  if (!user) {
    if (
      authScreen === "register"
    ) {
      return (
        <Register
          onLogin={() =>
            setAuthScreen(
              "login"
            )
          }
        />
      );
    }

    return (
      <Login
        onRegister={() =>
          setAuthScreen(
            "register"
          )
        }
      />
    );
  }

  /* =========================
     CARREGANDO DADOS
  ========================= */

  if (!userDataLoaded) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-logo">
          FinanSmart
        </div>

        <div className="auth-loading-spinner" />

        <span>
          Preparando seu painel...
        </span>
      </div>
    );
  }

  /* =========================
     PRIMEIRO ACESSO
  ========================= */

  if (
    !initialBalanceConfigured
  ) {
    return (
      <InitialBalance
        userName={
          user.displayName
        }
        onSave={
          handleInitialBalance
        }
      />
    );
  }

  /* =========================
     SISTEMA
  ========================= */

  return (
    <div className="app">
      <Sidebar
        currentPage={
          currentPage
        }
        onPageChange={
          setCurrentPage
        }
        userName={
          user.displayName
        }
        userEmail={
          user.email
        }
        onLogout={
          openLogoutModal
        }
      />

      {/* DASHBOARD */}

      {currentPage ===
        "dashboard" && (
       <Dashboard
  transactions={transactions}
  initialBalance={initialBalance}
  userName={user?.displayName}
  userEmail={user?.email}
  onNewTransaction={() => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  }}
  onViewTransactions={() =>
    setCurrentPage("transactions")
  }
  onOpenSettings={() =>
    setCurrentPage("settings")
  }
  onLogout={openLogoutModal}
/>
      )}

      {/* TRANSAÇÕES */}

      {currentPage ===
        "transactions" && (
        <Transactions
          transactions={
            transactions
          }
          onNewTransaction={
            openTransactionModal
          }
          onDeleteTransaction={
            handleDeleteTransaction
          }
          onEditTransaction={
            handleEditTransaction
          }
        />
      )}

      {/* ORÇAMENTOS */}

      {currentPage ===
        "budgets" && (
        <Budgets
          transactions={
            transactions
          }
          userId={user.uid}
        />
      )}

      {/* METAS */}

      {currentPage ===
        "goals" && (
        <Goals
          userId={user.uid}
        />
      )}

      {/* RELATÓRIOS */}

      {currentPage ===
        "reports" && (
        <Reports
          transactions={
            transactions
          }
          initialBalance={
            initialBalance
          }
        />
      )}

      {/* ASSISTENTE */}

      {currentPage ===
        "assistant" && (
        <Assistant
          transactions={
            transactions
          }
          initialBalance={
            initialBalance
          }
          userName={
            user.displayName
          }
        />
      )}

      {/* CONFIGURAÇÕES */}

      {currentPage ===
        "settings" && (
        <Settings
          userName={
            user.displayName
          }
          userEmail={
            user.email
          }
          initialBalance={
            initialBalance
          }
          onUpdateName={
            handleUpdateName
          }
          onUpdateInitialBalance={
            handleInitialBalance
          }
          onLogout={
            openLogoutModal
          }
        />
      )}

      {/* MODAL DE TRANSAÇÃO */}

      {isTransactionModalOpen && (
        <TransactionModal
          onClose={
            closeTransactionModal
          }
          onSave={
            handleSaveTransaction
          }
          initialData={
            editingTransaction
          }
        />
      )}

      {/* MODAL DE LOGOUT */}

      {isLogoutModalOpen && (
        <div
          className="logout-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeLogoutModal();
            }
          }}
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <button
              type="button"
              className="logout-modal-close"
              onClick={
                closeLogoutModal
              }
              disabled={
                isLoggingOut
              }
              aria-label="Fechar"
            >
              <FaXmark />
            </button>

            <div className="logout-modal-icon">
              <FaArrowRightFromBracket />
            </div>

            <div className="logout-modal-content">
              <h2 id="logout-title">
                Sair da conta?
              </h2>

              <p>
                Tem certeza que deseja
                encerrar sua sessão no
                FinanSmart?
              </p>
            </div>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-cancel"
                onClick={
                  closeLogoutModal
                }
                disabled={
                  isLoggingOut
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="logout-modal-confirm"
                onClick={
                  handleLogout
                }
                disabled={
                  isLoggingOut
                }
              >
                <FaArrowRightFromBracket />

                {isLoggingOut
                  ? "Saindo..."
                  : "Sair da conta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
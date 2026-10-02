import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaArrowDown,
  FaArrowUp,
  FaBell,
  FaCheck,
  FaChevronDown,
  FaCircleCheck,
  FaCreditCard,
  FaEllipsis,
  FaGear,
  FaPlus,
  FaTriangleExclamation,
  FaUser,
  FaArrowRightFromBracket,
  FaUtensils,
  FaWifi,
  FaCar,
  FaHouse,
  FaHeartPulse,
  FaGraduationCap,
  FaCartShopping,
  FaMoneyBillWave,
  FaWallet,
} from "react-icons/fa6";

import type { Transaction } from "./Transactions";

interface DashboardProps {
  transactions: Transaction[];
  initialBalance: number;
  userName?: string | null;
  userEmail?: string | null;
  onNewTransaction: () => void;
  onViewTransactions: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

interface DashboardNotification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(value);
}

function formatDate(date: string) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  if (date === today) {
    return "Hoje";
  }

  const [year, month, day] =
    date.split("-");

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return `${day} ${
    months[Number(month) - 1]
  } ${year}`;
}

function getCategoryIcon(
  category: string
) {
  switch (category) {
    case "Alimentação":
      return <FaUtensils />;

    case "Transporte":
      return <FaCar />;

    case "Moradia":
      return <FaHouse />;

    case "Contas":
      return <FaWifi />;

    case "Saúde":
      return <FaHeartPulse />;

    case "Educação":
      return <FaGraduationCap />;

    case "Compras":
      return <FaCartShopping />;

    case "Salário":
      return <FaMoneyBillWave />;

    default:
      return <FaCreditCard />;
  }
}

function Dashboard({
  transactions,
  initialBalance,
  userName,
  userEmail,
  onNewTransaction,
  onViewTransactions,
  onOpenSettings,
  onLogout,
}: DashboardProps) {
  /* =========================
     MENUS
  ========================= */

  const [
    isProfileMenuOpen,
    setIsProfileMenuOpen,
  ] = useState(false);

  const [
    isNotificationOpen,
    setIsNotificationOpen,
  ] = useState(false);

  const [
    notificationsRead,
    setNotificationsRead,
  ] = useState(false);

  const profileMenuRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const notificationRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =========================
     FECHAR MENUS AO CLICAR FORA
  ========================= */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          target
        )
      ) {
        setIsProfileMenuOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target
        )
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleOpenSettings() {
    setIsProfileMenuOpen(false);
    onOpenSettings();
  }

  function handleLogoutClick() {
    setIsProfileMenuOpen(false);
    onLogout();
  }

  /* =========================
     USUÁRIO
  ========================= */

  const displayName =
    userName?.trim() ||
    userEmail?.split("@")[0] ||
    "Usuário";

  const nameParts = displayName
    .trim()
    .split(" ")
    .filter(Boolean);

  const initials =
    nameParts.length > 1
      ? (
          nameParts[0][0] +
          nameParts[
            nameParts.length - 1
          ][0]
        ).toUpperCase()
      : displayName
          .substring(0, 2)
          .toUpperCase();

  /* =========================
     ENTRADAS
  ========================= */

  const totalIncome = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  }, [transactions]);

  /* =========================
     DESPESAS
  ========================= */

  const totalExpenses =
    useMemo(() => {
      return transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense"
        )
        .reduce(
          (total, transaction) =>
            total +
            transaction.amount,
          0
        );
    }, [transactions]);

  /* =========================
     SALDO
  ========================= */

  const balance =
    initialBalance +
    totalIncome -
    totalExpenses;

  const movementResult =
    totalIncome - totalExpenses;

  /* =========================
     CONTADORES
  ========================= */

  const incomeCount =
    useMemo(() => {
      return transactions.filter(
        (transaction) =>
          transaction.type ===
          "income"
      ).length;
    }, [transactions]);

  const expenseCount =
    useMemo(() => {
      return transactions.filter(
        (transaction) =>
          transaction.type ===
          "expense"
      ).length;
    }, [transactions]);

  /* =========================
     NOTIFICAÇÕES
  ========================= */

  const notifications =
    useMemo<
      DashboardNotification[]
    >(() => {
      const items:
        DashboardNotification[] = [];

      if (transactions.length === 0) {
        items.push({
          id: "no-transactions",
          type: "info",
          title:
            "Comece a organizar suas finanças",
          description:
            "Cadastre sua primeira entrada ou despesa para acompanhar sua vida financeira.",
        });

        return items;
      }

      if (balance < 0) {
        items.push({
          id: "negative-balance",
          type: "warning",
          title:
            "Saldo negativo",
          description: `Seu saldo atual está em ${formatCurrency(
            balance
          )}. Revise suas despesas.`,
        });
      }

      if (
        totalExpenses >
          totalIncome &&
        totalExpenses > 0
      ) {
        items.push({
          id: "expenses-income",
          type: "warning",
          title:
            "Despesas acima das entradas",
          description: `Suas despesas estão ${formatCurrency(
            totalExpenses -
              totalIncome
          )} acima das entradas registradas.`,
        });
      }

      if (
        balance >= 0 &&
        totalIncome > 0 &&
        totalExpenses <=
          totalIncome
      ) {
        items.push({
          id: "positive-balance",
          type: "success",
          title:
            "Finanças em equilíbrio",
          description:
            "Suas entradas estão cobrindo as despesas registradas até o momento.",
        });
      }

      return items;
    }, [
      transactions,
      balance,
      totalIncome,
      totalExpenses,
    ]);

  const unreadCount =
    notificationsRead
      ? 0
      : notifications.length;

  function handleNotificationClick() {
    setIsNotificationOpen(
      (current) => !current
    );

    setIsProfileMenuOpen(false);
  }

  function handleProfileClick() {
    setIsProfileMenuOpen(
      (current) => !current
    );

    setIsNotificationOpen(false);
  }

  function markNotificationsAsRead() {
    setNotificationsRead(true);
  }

  /*
    Se os dados financeiros mudarem,
    novas informações podem ser relevantes.
  */

  useEffect(() => {
    setNotificationsRead(false);
  }, [
    transactions,
    initialBalance,
  ]);

  /* =========================
     GASTOS POR CATEGORIA
  ========================= */

  const categoryTotals =
    useMemo(() => {
      const totals: Record<
        string,
        number
      > = {};

      transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense"
        )
        .forEach((transaction) => {
          totals[
            transaction.category
          ] =
            (totals[
              transaction.category
            ] || 0) +
            transaction.amount;
        });

      return Object.entries(totals)
        .sort(
          (a, b) => b[1] - a[1]
        )
        .slice(0, 3);
    }, [transactions]);

  /* =========================
     FLUXO DOS ÚLTIMOS 6 MESES
  ========================= */

  const cashFlowData =
    useMemo(() => {
      const now = new Date();

      const monthNames = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];

      return Array.from(
        { length: 6 },
        (_, index) => {
          const monthDate =
            new Date(
              now.getFullYear(),
              now.getMonth() -
                5 +
                index,
              1
            );

          const year =
            monthDate.getFullYear();

          const month =
            monthDate.getMonth();

          let income = 0;
          let expense = 0;

          transactions.forEach(
            (transaction) => {
              const [
                transactionYear,
                transactionMonth,
              ] = transaction.date
                .split("-")
                .map(Number);

              if (
                transactionYear ===
                  year &&
                transactionMonth -
                  1 ===
                  month
              ) {
                if (
                  transaction.type ===
                  "income"
                ) {
                  income +=
                    transaction.amount;
                } else {
                  expense +=
                    transaction.amount;
                }
              }
            }
          );

          return {
            label:
              monthNames[month],
            income,
            expense,
          };
        }
      );
    }, [transactions]);

  const hasCashFlowData =
    cashFlowData.some(
      (month) =>
        month.income > 0 ||
        month.expense > 0
    );

  const maxCashFlowValue =
    Math.max(
      ...cashFlowData.flatMap(
        (month) => [
          month.income,
          month.expense,
        ]
      ),
      1
    );

  function createChartPoints(
    type: "income" | "expense"
  ) {
    const width = 700;
    const top = 25;
    const bottom = 185;

    return cashFlowData
      .map((month, index) => {
        const x =
          cashFlowData.length === 1
            ? 0
            : (index /
                (cashFlowData.length -
                  1)) *
              width;

        const value =
          month[type];

        const y =
          bottom -
          (value /
            maxCashFlowValue) *
            (bottom - top);

        return `${x},${y}`;
      })
      .join(" ");
  }

  return (
    <main className="dashboard">
      {/* =========================
          TOPO
      ========================= */}

      <header className="dashboard-topbar">
        <div>
          <h1>Visão geral</h1>

          <p>
            Acompanhe sua vida
            financeira
          </p>
        </div>

        <div className="topbar-actions">
          {/* =========================
              NOTIFICAÇÕES
          ========================= */}

          <div
            className="notification-wrapper"
            ref={notificationRef}
          >
            <button
              type="button"
              className={`notification-button ${
                isNotificationOpen
                  ? "notification-open"
                  : ""
              }`}
              onClick={
                handleNotificationClick
              }
              aria-label="Notificações"
              aria-expanded={
                isNotificationOpen
              }
            >
              <FaBell />

              {unreadCount > 0 && (
                <span className="notification-dot">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="notification-panel">
                <div className="notification-panel-header">
                  <div>
                    <h3>
                      Notificações
                    </h3>

                    <span>
                      {unreadCount > 0
                        ? `${unreadCount} ${
                            unreadCount ===
                            1
                              ? "nova"
                              : "novas"
                          }`
                        : "Tudo em dia"}
                    </span>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="mark-read-button"
                      onClick={
                        markNotificationsAsRead
                      }
                    >
                      <FaCheck />

                      Marcar como lidas
                    </button>
                  )}
                </div>

                <div className="notification-divider" />

                <div className="notification-list">
                  {notifications.length >
                  0 ? (
                    notifications.map(
                      (
                        notification
                      ) => (
                        <div
                          key={
                            notification.id
                          }
                          className={`notification-item ${notification.type}`}
                        >
                          <div
                            className={`notification-icon ${notification.type}`}
                          >
                            {notification.type ===
                            "warning" ? (
                              <FaTriangleExclamation />
                            ) : notification.type ===
                              "success" ? (
                              <FaCircleCheck />
                            ) : (
                              <FaWallet />
                            )}
                          </div>

                          <div className="notification-content">
                            <strong>
                              {
                                notification.title
                              }
                            </strong>

                            <p>
                              {
                                notification.description
                              }
                            </p>

                            <span>
                              Agora
                            </span>
                          </div>

                          {!notificationsRead && (
                            <span className="notification-unread-indicator" />
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">
                        <FaBell />
                      </div>

                      <strong>
                        Tudo em dia
                      </strong>

                      <p>
                        Você não possui
                        notificações no
                        momento.
                      </p>
                    </div>
                  )}
                </div>

                {notifications.length >
                  0 && (
                  <div className="notification-panel-footer">
                    <span>
                      Avisos gerados a
                      partir das suas
                      movimentações
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =========================
              PERFIL
          ========================= */}

          <div
            className="topbar-profile-wrapper"
            ref={profileMenuRef}
          >
            <button
              type="button"
              className={`topbar-user ${
                isProfileMenuOpen
                  ? "profile-open"
                  : ""
              }`}
              onClick={
                handleProfileClick
              }
              aria-expanded={
                isProfileMenuOpen
              }
              aria-label="Abrir menu da conta"
            >
              <div className="topbar-avatar">
                {initials}
              </div>

              <div className="topbar-user-information">
                <strong>
                  {displayName}
                </strong>

                <span>
                  Conta pessoal
                </span>
              </div>

              <FaChevronDown
                className="user-chevron"
              />
            </button>

            {isProfileMenuOpen && (
              <div className="topbar-profile-menu">
                <div className="topbar-profile-header">
                  <div className="topbar-profile-avatar">
                    {initials}
                  </div>

                  <div className="topbar-profile-header-info">
                    <strong>
                      {displayName}
                    </strong>

                    <span>
                      {userEmail ||
                        "Conta pessoal"}
                    </span>
                  </div>
                </div>

                <div className="topbar-profile-divider" />

                <button
                  type="button"
                  className="topbar-profile-menu-item"
                  onClick={
                    handleOpenSettings
                  }
                >
                  <div className="topbar-profile-menu-icon">
                    <FaUser />
                  </div>

                  <div>
                    <strong>
                      Minha conta
                    </strong>

                    <span>
                      Dados pessoais e
                      segurança
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="topbar-profile-menu-item"
                  onClick={
                    handleOpenSettings
                  }
                >
                  <div className="topbar-profile-menu-icon">
                    <FaGear />
                  </div>

                  <div>
                    <strong>
                      Configurações
                    </strong>

                    <span>
                      Preferências da
                      sua conta
                    </span>
                  </div>
                </button>

                <div className="topbar-profile-divider" />

                <button
                  type="button"
                  className="topbar-profile-menu-item topbar-profile-logout"
                  onClick={
                    handleLogoutClick
                  }
                >
                  <div className="topbar-profile-menu-icon">
                    <FaArrowRightFromBracket />
                  </div>

                  <div>
                    <strong>
                      Sair da conta
                    </strong>

                    <span>
                      Encerrar esta
                      sessão
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =========================
          SALDO
      ========================= */}

      <section className="balance-section">
        <div className="balance-information">
          <span className="balance-label">
            Saldo disponível
          </span>

          <div className="balance-value">
            <strong>
              {formatCurrency(
                balance
              )}
            </strong>
          </div>

          <div className="balance-comparison">
            <span
              className={
                balance >= 0
                  ? "comparison-positive"
                  : "comparison-negative"
              }
            >
              Saldo inicial + entradas
              - despesas
            </span>
          </div>
        </div>

        <button
          type="button"
          className="add-transaction-button"
          onClick={
            onNewTransaction
          }
        >
          <FaPlus />

          Nova transação
        </button>
      </section>

      {/* =========================
          RESUMO
      ========================= */}

      <section className="financial-summary">
        <article className="financial-card">
          <div className="financial-card-top">
            <span>Entradas</span>

            <div className="financial-icon income">
              <FaArrowUp />
            </div>
          </div>

          <strong>
            {formatCurrency(
              totalIncome
            )}
          </strong>

          <div className="financial-change positive">
            <FaArrowUp />

            <span>
              {incomeCount}
            </span>

            <p>
              {incomeCount === 1
                ? "entrada cadastrada"
                : "entradas cadastradas"}
            </p>
          </div>
        </article>

        <article className="financial-card">
          <div className="financial-card-top">
            <span>Despesas</span>

            <div className="financial-icon expense">
              <FaArrowDown />
            </div>
          </div>

          <strong>
            {formatCurrency(
              totalExpenses
            )}
          </strong>

          <div className="financial-change negative">
            <FaArrowDown />

            <span>
              {expenseCount}
            </span>

            <p>
              {expenseCount === 1
                ? "despesa cadastrada"
                : "despesas cadastradas"}
            </p>
          </div>
        </article>

        <article className="financial-card">
          <div className="financial-card-top">
            <span>
              Saldo inicial
            </span>

            <div className="financial-icon savings">
              <FaCreditCard />
            </div>
          </div>

          <strong>
            {formatCurrency(
              initialBalance
            )}
          </strong>

          <div
            className={`financial-change ${
              movementResult >= 0
                ? "positive"
                : "negative"
            }`}
          >
            {movementResult >= 0 ? (
              <FaArrowUp />
            ) : (
              <FaArrowDown />
            )}

            <p>
              {movementResult === 0
                ? "Sem movimentações"
                : movementResult > 0
                ? `${formatCurrency(
                    movementResult
                  )} em movimentações`
                : `${formatCurrency(
                    Math.abs(
                      movementResult
                    )
                  )} abaixo das entradas`}
            </p>
          </div>
        </article>
      </section>

      {/* =========================
          MEIO
      ========================= */}

      <section className="dashboard-middle">
        {/* FLUXO DE CAIXA */}

        <article className="cash-flow-card">
          <div className="card-heading">
            <div>
              <h2>
                Fluxo de caixa
              </h2>

              <p>
                Entradas e despesas
                dos últimos meses
              </p>
            </div>

            <button
              type="button"
              className="period-button"
            >
              Últimos 6 meses

              <FaChevronDown />
            </button>
          </div>

          <div className="chart-legend">
            <div>
              <span className="legend-dot income-dot" />

              Entradas
            </div>

            <div>
              <span className="legend-dot expense-dot" />

              Despesas
            </div>
          </div>

          <div className="line-chart">
            <div className="chart-grid-line line-1" />
            <div className="chart-grid-line line-2" />
            <div className="chart-grid-line line-3" />
            <div className="chart-grid-line line-4" />

            {hasCashFlowData ? (
              <svg
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
                className="chart-svg"
              >
                <polyline
                  className="income-line"
                  points={createChartPoints(
                    "income"
                  )}
                />

                <polyline
                  className="expense-line"
                  points={createChartPoints(
                    "expense"
                  )}
                />
              </svg>
            ) : (
              <div className="chart-empty-state">
                <span>
                  Nenhuma movimentação
                  registrada.
                </span>

                <p>
                  O gráfico aparecerá
                  conforme você
                  cadastrar entradas e
                  despesas.
                </p>
              </div>
            )}
          </div>

          <div className="chart-labels">
            {cashFlowData.map(
              (month, index) => (
                <span key={index}>
                  {month.label}
                </span>
              )
            )}
          </div>
        </article>

        {/* CATEGORIAS */}

        <article className="categories-card">
          <div className="card-heading">
            <div>
              <h2>
                Gastos por categoria
              </h2>

              <p>
                Resumo das despesas
              </p>
            </div>

            <button
              type="button"
              className="more-button"
            >
              <FaEllipsis />
            </button>
          </div>

          <div className="category-list">
            {categoryTotals.length ===
            0 ? (
              <p className="empty-message">
                Nenhuma despesa
                cadastrada.
              </p>
            ) : (
              categoryTotals.map(
                ([
                  category,
                  amount,
                ]) => {
                  const percentage =
                    totalExpenses > 0
                      ? (amount /
                          totalExpenses) *
                        100
                      : 0;

                  return (
                    <div
                      key={category}
                      className="category-group"
                    >
                      <div className="category-item">
                        <div className="category-info">
                          <div className="category-icon shopping">
                            {getCategoryIcon(
                              category
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                category
                              }
                            </strong>

                            <span>
                              {percentage.toFixed(
                                0
                              )}
                              % das
                              despesas
                            </span>
                          </div>
                        </div>

                        <strong>
                          {formatCurrency(
                            amount
                          )}
                        </strong>
                      </div>

                      <div className="category-progress">
                        <div
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </article>
      </section>

      {/* =========================
          PARTE INFERIOR
      ========================= */}

      <section className="dashboard-bottom">
        {/* TRANSAÇÕES RECENTES */}

        <article className="recent-transactions">
          <div className="card-heading">
            <div>
              <h2>
                Transações recentes
              </h2>

              <p>
                Suas últimas
                movimentações
              </p>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={
                onViewTransactions
              }
            >
              Ver todas
            </button>
          </div>

          <div className="transaction-list">
            {transactions.length ===
            0 ? (
              <p className="empty-message">
                Nenhuma transação
                cadastrada.
              </p>
            ) : (
              transactions
                .slice(0, 5)
                .map(
                  (transaction) => (
                    <div
                      className="transaction-row"
                      key={
                        transaction.id
                      }
                    >
                      <div className="transaction-description">
                        <div
                          className={`transaction-symbol ${
                            transaction.type ===
                            "income"
                              ? "income-symbol"
                              : "expense-symbol"
                          }`}
                        >
                          {getCategoryIcon(
                            transaction.category
                          )}
                        </div>

                        <div>
                          <strong>
                            {
                              transaction.description
                            }
                          </strong>

                          <span>
                            {
                              transaction.category
                            }
                          </span>
                        </div>
                      </div>

                      <span className="transaction-date">
                        {formatDate(
                          transaction.date
                        )}
                      </span>

                      <strong
                        className={
                          transaction.type ===
                          "income"
                            ? "transaction-income"
                            : "transaction-expense"
                        }
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}{" "}

                        {formatCurrency(
                          transaction.amount
                        )}
                      </strong>
                    </div>
                  )
                )
            )}
          </div>
        </article>

        {/* RESUMO FINANCEIRO */}

        <article className="budget-card">
          <div className="card-heading">
            <div>
              <h2>
                Resumo do saldo
              </h2>

              <p>
                Situação atual
              </p>
            </div>
          </div>

          <div className="budget-values">
            <strong>
              {formatCurrency(
                balance
              )}
            </strong>

            <span>
              saldo disponível
            </span>
          </div>

          <div className="budget-progress">
            <div
              style={{
                width:
                  initialBalance > 0
                    ? `${Math.min(
                        Math.max(
                          (balance /
                            initialBalance) *
                            100,
                          0
                        ),
                        100
                      )}%`
                    : "0%",
              }}
            />
          </div>

          <div className="budget-status">
            <span>
              Entradas{" "}
              {formatCurrency(
                totalIncome
              )}
            </span>

            <strong>
              Despesas{" "}
              {formatCurrency(
                totalExpenses
              )}
            </strong>
          </div>

          <div className="budget-message">
            <p>
              {balance >= 0
                ? "Seu saldo está positivo."
                : "Atenção: suas despesas ultrapassaram seu saldo disponível."}
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
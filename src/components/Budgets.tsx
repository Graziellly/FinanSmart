import { useEffect, useMemo, useState } from "react";

import {
  FaPlus,
  FaUtensils,
  FaCar,
  FaHouse,
  FaWifi,
  FaHeartPulse,
  FaGraduationCap,
  FaCartShopping,
  FaGamepad,
  FaWallet,
  FaTrash,
  FaTriangleExclamation,
  FaCircleCheck,
} from "react-icons/fa6";

import type { Transaction } from "./Transactions";

/* =========================
   TIPOS
========================= */

export interface Budget {
  id: number;
  category: string;
  limit: number;
}

interface BudgetsProps {
  transactions: Transaction[];
  userId: string;
}

/* =========================
   CATEGORIAS
========================= */

const categories = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Contas",
  "Compras",
  "Saúde",
  "Educação",
  "Lazer",
  "Outros",
];

/* =========================
   FORMATAÇÃO
========================= */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/* =========================
   ÍCONES
========================= */

function getCategoryIcon(category: string) {
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

    case "Lazer":
      return <FaGamepad />;

    default:
      return <FaWallet />;
  }
}

/* =========================
   COMPONENTE
========================= */

function Budgets({
  transactions,
  userId,
}: BudgetsProps) {
  const [budgets, setBudgets] =
    useState<Budget[]>([]);

  const [
    budgetsLoaded,
    setBudgetsLoaded,
  ] = useState(false);

  const [
    isCreatingBudget,
    setIsCreatingBudget,
  ] = useState(false);

  const [category, setCategory] =
    useState("Alimentação");

  const [limit, setLimit] =
    useState("");

  /* =========================
     CHAVE DO USUÁRIO
  ========================= */

  const storageKey =
    `finansmart-budgets-${userId}`;

  /* =========================
     CARREGAR ORÇAMENTOS
  ========================= */

  useEffect(() => {
    setBudgetsLoaded(false);

    const savedBudgets =
      localStorage.getItem(storageKey);

    if (!savedBudgets) {
      setBudgets([]);
      setBudgetsLoaded(true);
      return;
    }

    try {
      const parsedBudgets =
        JSON.parse(savedBudgets);

      if (Array.isArray(parsedBudgets)) {
        setBudgets(parsedBudgets);
      } else {
        setBudgets([]);
      }
    } catch {
      setBudgets([]);
    }

    setBudgetsLoaded(true);
  }, [storageKey]);

  /* =========================
     SALVAR AUTOMATICAMENTE
  ========================= */

  useEffect(() => {
    if (!budgetsLoaded) {
      return;
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify(budgets)
    );
  }, [
    budgets,
    budgetsLoaded,
    storageKey,
  ]);

  /* =========================
     GASTOS POR CATEGORIA
  ========================= */

  const expensesByCategory =
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

      return totals;
    }, [transactions]);

  /* =========================
     TOTAL DOS ORÇAMENTOS
  ========================= */

  const totalBudget =
    useMemo(() => {
      return budgets.reduce(
        (total, budget) =>
          total + budget.limit,
        0
      );
    }, [budgets]);

  /* =========================
     TOTAL GASTO
  ========================= */

  const totalSpent =
    useMemo(() => {
      return budgets.reduce(
        (total, budget) =>
          total +
          (expensesByCategory[
            budget.category
          ] || 0),
        0
      );
    }, [
      budgets,
      expensesByCategory,
    ]);

  /* =========================
     SALVAR ORÇAMENTOS
  ========================= */

  function saveBudgets(
    updatedBudgets: Budget[]
  ) {
    setBudgets(updatedBudgets);
  }

  /* =========================
     CRIAR ORÇAMENTO
  ========================= */

  function handleCreateBudget(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const numericLimit =
      Number(
        limit
          .replace(/\./g, "")
          .replace(",", ".")
      );

    if (
      !Number.isFinite(numericLimit) ||
      numericLimit <= 0
    ) {
      alert(
        "Digite um limite válido."
      );

      return;
    }

    const existingBudget =
      budgets.find(
        (budget) =>
          budget.category ===
          category
      );

    if (existingBudget) {
      alert(
        "Já existe um orçamento para essa categoria."
      );

      return;
    }

    const newBudget: Budget = {
      id: Date.now(),
      category,
      limit: numericLimit,
    };

    saveBudgets([
      newBudget,
      ...budgets,
    ]);

    setLimit("");
    setCategory("Alimentação");
    setIsCreatingBudget(false);
  }

  /* =========================
     EXCLUIR ORÇAMENTO
  ========================= */

  function handleDeleteBudget(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Deseja excluir este orçamento?"
      );

    if (!confirmed) {
      return;
    }

    const updatedBudgets =
      budgets.filter(
        (budget) =>
          budget.id !== id
      );

    saveBudgets(
      updatedBudgets
    );
  }

  return (
    <main className="budgets-page">
      {/* CABEÇALHO */}

      <header className="budgets-header">
        <div>
          <h1>Orçamentos</h1>

          <p>
            Defina limites para seus
            gastos e acompanhe seu
            planejamento mensal.
          </p>
        </div>

        <button
          type="button"
          className="add-transaction-button"
          onClick={() =>
            setIsCreatingBudget(
              true
            )
          }
        >
          <FaPlus />

          Novo orçamento
        </button>
      </header>

      {/* RESUMO */}

      <section className="budget-summary-grid">
        <article className="budget-summary-card">
          <span>
            Orçamento total
          </span>

          <strong>
            {formatCurrency(
              totalBudget
            )}
          </strong>

          <p>
            Limite planejado para
            o mês
          </p>
        </article>

        <article className="budget-summary-card">
          <span>
            Total utilizado
          </span>

          <strong>
            {formatCurrency(
              totalSpent
            )}
          </strong>

          <p>
            Gastos registrados
          </p>
        </article>

        <article className="budget-summary-card">
          <span>
            Disponível
          </span>

          <strong>
            {formatCurrency(
              Math.max(
                totalBudget -
                  totalSpent,
                0
              )
            )}
          </strong>

          <p>
            Restante dos
            orçamentos
          </p>
        </article>
      </section>

      {/* LISTA */}

      <section className="budgets-container">
        <div className="budgets-section-heading">
          <div>
            <h2>
              Orçamentos por categoria
            </h2>

            <p>
              Acompanhe seus limites
              mensais.
            </p>
          </div>
        </div>

        {!budgetsLoaded ? (
          <div className="budgets-empty">
            <FaWallet />

            <h3>
              Carregando orçamentos...
            </h3>
          </div>
        ) : budgets.length === 0 ? (
          <div className="budgets-empty">
            <FaWallet />

            <h3>
              Nenhum orçamento
            </h3>

            <p>
              Crie seu primeiro
              orçamento para começar
              a acompanhar seus gastos.
            </p>
          </div>
        ) : (
          <div className="budget-cards-grid">
            {budgets.map(
              (budget) => {
                const spent =
                  expensesByCategory[
                    budget.category
                  ] || 0;

                const percentage =
                  budget.limit > 0
                    ? (spent /
                        budget.limit) *
                      100
                    : 0;

                const remaining =
                  budget.limit -
                  spent;

                const exceeded =
                  percentage > 100;

                const warning =
                  percentage >= 80 &&
                  percentage <= 100;

                return (
                  <article
                    className="category-budget-card"
                    key={budget.id}
                  >
                    <div className="budget-card-top">
                      <div className="budget-category">
                        <div className="budget-category-icon">
                          {getCategoryIcon(
                            budget.category
                          )}
                        </div>

                        <div>
                          <h3>
                            {
                              budget.category
                            }
                          </h3>

                          <span>
                            Limite mensal
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="delete-budget-button"
                        title="Excluir orçamento"
                        onClick={() =>
                          handleDeleteBudget(
                            budget.id
                          )
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="budget-card-values">
                      <div>
                        <span>
                          Gasto
                        </span>

                        <strong>
                          {formatCurrency(
                            spent
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Limite
                        </span>

                        <strong>
                          {formatCurrency(
                            budget.limit
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="budget-category-progress">
                      <div
                        className={
                          exceeded
                            ? "budget-progress-fill exceeded"
                            : warning
                            ? "budget-progress-fill warning"
                            : "budget-progress-fill"
                        }
                        style={{
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="budget-card-footer">
                      <span>
                        {percentage.toFixed(
                          0
                        )}
                        % utilizado
                      </span>

                      {exceeded ? (
                        <div className="budget-alert exceeded">
                          <FaTriangleExclamation />

                          Limite excedido
                        </div>
                      ) : warning ? (
                        <div className="budget-alert warning">
                          <FaTriangleExclamation />

                          Próximo do limite
                        </div>
                      ) : (
                        <div className="budget-alert good">
                          <FaCircleCheck />

                          {formatCurrency(
                            Math.max(
                              remaining,
                              0
                            )
                          )}{" "}
                          disponível
                        </div>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* MODAL NOVO ORÇAMENTO */}

      {isCreatingBudget && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setIsCreatingBudget(
              false
            )
          }
        >
          <div
            className="transaction-modal budget-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  Novo orçamento
                </h2>

                <p>
                  Defina um limite
                  mensal para uma
                  categoria.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setIsCreatingBudget(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleCreateBudget
              }
            >
              <div className="form-group">
                <label>
                  Categoria
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value
                    )
                  }
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Limite mensal
                </label>

                <div className="money-input">
                  <span>R$</span>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={limit}
                    onChange={(
                      event
                    ) =>
                      setLimit(
                        event.target
                          .value
                      )
                    }
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setIsCreatingBudget(
                      false
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="save-transaction-button"
                >
                  Criar orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Budgets;
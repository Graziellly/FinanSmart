import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaPlus,
  FaBullseye,
  FaLaptop,
  FaCar,
  FaPlane,
  FaHouse,
  FaPiggyBank,
  FaTrash,
  FaCircleCheck,
  FaWallet,
} from "react-icons/fa6";

/* =========================
   TIPOS
========================= */

export interface Goal {
  id: number;
  name: string;
  target: number;
  saved: number;
  category: string;
}

interface GoalsProps {
  userId: string;
}

/* =========================
   CATEGORIAS
========================= */

const goalCategories = [
  "Reserva",
  "Tecnologia",
  "Viagem",
  "Carro",
  "Casa",
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

function getGoalIcon(category: string) {
  switch (category) {
    case "Reserva":
      return <FaPiggyBank />;

    case "Tecnologia":
      return <FaLaptop />;

    case "Viagem":
      return <FaPlane />;

    case "Carro":
      return <FaCar />;

    case "Casa":
      return <FaHouse />;

    default:
      return <FaBullseye />;
  }
}

/* =========================
   COMPONENTE
========================= */

function Goals({
  userId,
}: GoalsProps) {
  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [
    goalsLoaded,
    setGoalsLoaded,
  ] = useState(false);

  const [
    isCreatingGoal,
    setIsCreatingGoal,
  ] = useState(false);

  const [
    selectedGoal,
    setSelectedGoal,
  ] = useState<Goal | null>(null);

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("Reserva");

  const [target, setTarget] =
    useState("");

  const [
    initialValue,
    setInitialValue,
  ] = useState("");

  const [
    depositValue,
    setDepositValue,
  ] = useState("");

  /* =========================
     CHAVE DO USUÁRIO
  ========================= */

  const storageKey =
    `finansmart-goals-${userId}`;

  /* =========================
     CARREGAR METAS
  ========================= */

  useEffect(() => {
    setGoalsLoaded(false);

    const savedGoals =
      localStorage.getItem(storageKey);

    if (!savedGoals) {
      setGoals([]);
      setGoalsLoaded(true);
      return;
    }

    try {
      const parsedGoals =
        JSON.parse(savedGoals);

      if (Array.isArray(parsedGoals)) {
        setGoals(parsedGoals);
      } else {
        setGoals([]);
      }
    } catch {
      setGoals([]);
    }

    setGoalsLoaded(true);
  }, [storageKey]);

  /* =========================
     SALVAR AUTOMATICAMENTE
  ========================= */

  useEffect(() => {
    if (!goalsLoaded) {
      return;
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify(goals)
    );
  }, [
    goals,
    goalsLoaded,
    storageKey,
  ]);

  /* =========================
     RESUMO
  ========================= */

  const totalTarget =
    useMemo(() => {
      return goals.reduce(
        (total, goal) =>
          total + goal.target,
        0
      );
    }, [goals]);

  const totalSaved =
    useMemo(() => {
      return goals.reduce(
        (total, goal) =>
          total + goal.saved,
        0
      );
    }, [goals]);

  const completedGoals =
    useMemo(() => {
      return goals.filter(
        (goal) =>
          goal.saved >= goal.target
      ).length;
    }, [goals]);

  /* =========================
     SALVAR
  ========================= */

  function saveGoals(
    updatedGoals: Goal[]
  ) {
    setGoals(updatedGoals);
  }

  /* =========================
     CRIAR META
  ========================= */

  function handleCreateGoal(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const numericTarget =
      Number(
        target
          .replace(/\./g, "")
          .replace(",", ".")
      );

    const numericInitialValue =
      initialValue.trim() === ""
        ? 0
        : Number(
            initialValue
              .replace(/\./g, "")
              .replace(",", ".")
          );

    if (!name.trim()) {
      alert(
        "Digite o nome da meta."
      );

      return;
    }

    if (
      !Number.isFinite(numericTarget) ||
      numericTarget <= 0
    ) {
      alert(
        "Digite um valor válido para a meta."
      );

      return;
    }

    if (
      !Number.isFinite(
        numericInitialValue
      ) ||
      numericInitialValue < 0
    ) {
      alert(
        "Digite um valor inicial válido."
      );

      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      name: name.trim(),
      target: numericTarget,
      saved: numericInitialValue,
      category,
    };

    saveGoals([
      newGoal,
      ...goals,
    ]);

    setName("");
    setTarget("");
    setInitialValue("");
    setCategory("Reserva");
    setIsCreatingGoal(false);
  }

  /* =========================
     ADICIONAR DINHEIRO
  ========================= */

  function handleDeposit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedGoal) {
      return;
    }

    const numericDeposit =
      Number(
        depositValue
          .replace(/\./g, "")
          .replace(",", ".")
      );

    if (
      !Number.isFinite(
        numericDeposit
      ) ||
      numericDeposit <= 0
    ) {
      alert(
        "Digite um valor válido."
      );

      return;
    }

    const updatedGoals =
      goals.map((goal) =>
        goal.id === selectedGoal.id
          ? {
              ...goal,
              saved:
                goal.saved +
                numericDeposit,
            }
          : goal
      );

    saveGoals(updatedGoals);

    setDepositValue("");
    setSelectedGoal(null);
  }

  /* =========================
     EXCLUIR META
  ========================= */

  function handleDeleteGoal(
    id: number
  ) {
    const confirmed =
      window.confirm(
        "Deseja realmente excluir esta meta?"
      );

    if (!confirmed) {
      return;
    }

    const updatedGoals =
      goals.filter(
        (goal) =>
          goal.id !== id
      );

    saveGoals(updatedGoals);
  }

  return (
    <main className="goals-page">
      {/* CABEÇALHO */}

      <header className="goals-header">
        <div>
          <h1>Metas</h1>

          <p>
            Planeje seus objetivos
            financeiros e acompanhe sua
            evolução.
          </p>
        </div>

        <button
          type="button"
          className="add-transaction-button"
          onClick={() =>
            setIsCreatingGoal(true)
          }
        >
          <FaPlus />
          Nova meta
        </button>
      </header>

      {/* RESUMO */}

      <section className="goals-summary">
        <article className="goal-summary-card">
          <div className="goal-summary-icon">
            <FaBullseye />
          </div>

          <div>
            <span>
              Valor das metas
            </span>

            <strong>
              {formatCurrency(
                totalTarget
              )}
            </strong>

            <p>
              Total planejado
            </p>
          </div>
        </article>

        <article className="goal-summary-card">
          <div className="goal-summary-icon">
            <FaWallet />
          </div>

          <div>
            <span>
              Total acumulado
            </span>

            <strong>
              {formatCurrency(
                totalSaved
              )}
            </strong>

            <p>
              Valor já reservado
            </p>
          </div>
        </article>

        <article className="goal-summary-card">
          <div className="goal-summary-icon">
            <FaCircleCheck />
          </div>

          <div>
            <span>
              Metas concluídas
            </span>

            <strong>
              {completedGoals}
            </strong>

            <p>
              de {goals.length} metas
            </p>
          </div>
        </article>
      </section>

      {/* METAS */}

      <section className="goals-container">
        <div className="goals-section-heading">
          <div>
            <h2>
              Minhas metas
            </h2>

            <p>
              Acompanhe o progresso dos
              seus objetivos.
            </p>
          </div>
        </div>

        {!goalsLoaded ? (
          <div className="goals-empty">
            <FaBullseye />

            <h3>
              Carregando metas...
            </h3>
          </div>
        ) : goals.length === 0 ? (
          <div className="goals-empty">
            <FaBullseye />

            <h3>
              Nenhuma meta criada
            </h3>

            <p>
              Crie sua primeira meta
              financeira para começar a
              acompanhar seu progresso.
            </p>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => {
              const percentage =
                goal.target > 0
                  ? (goal.saved /
                      goal.target) *
                    100
                  : 0;

              const remaining =
                Math.max(
                  goal.target -
                    goal.saved,
                  0
                );

              const completed =
                goal.saved >=
                goal.target;

              return (
                <article
                  className="goal-card"
                  key={goal.id}
                >
                  <div className="goal-card-top">
                    <div className="goal-title">
                      <div className="goal-icon">
                        {getGoalIcon(
                          goal.category
                        )}
                      </div>

                      <div>
                        <h3>
                          {goal.name}
                        </h3>

                        <span>
                          {goal.category}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="delete-goal-button"
                      title="Excluir meta"
                      onClick={() =>
                        handleDeleteGoal(
                          goal.id
                        )
                      }
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="goal-values">
                    <div>
                      <span>
                        Acumulado
                      </span>

                      <strong>
                        {formatCurrency(
                          goal.saved
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Objetivo
                      </span>

                      <strong>
                        {formatCurrency(
                          goal.target
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="goal-progress">
                    <div
                      className={
                        completed
                          ? "goal-progress-fill completed"
                          : "goal-progress-fill"
                      }
                      style={{
                        width: `${Math.min(
                          percentage,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="goal-progress-info">
                    <span>
                      {Math.min(
                        percentage,
                        100
                      ).toFixed(0)}
                      % concluído
                    </span>

                    {completed ? (
                      <strong className="goal-completed">
                        <FaCircleCheck />
                        Meta concluída
                      </strong>
                    ) : (
                      <strong>
                        Faltam{" "}
                        {formatCurrency(
                          remaining
                        )}
                      </strong>
                    )}
                  </div>

                  {!completed && (
                    <button
                      type="button"
                      className="goal-deposit-button"
                      onClick={() =>
                        setSelectedGoal(
                          goal
                        )
                      }
                    >
                      <FaPlus />
                      Adicionar valor
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================
          MODAL NOVA META
      ========================= */}

      {isCreatingGoal && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setIsCreatingGoal(
              false
            )
          }
        >
          <div
            className="transaction-modal goal-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  Nova meta
                </h2>

                <p>
                  Crie um novo objetivo
                  financeiro.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setIsCreatingGoal(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleCreateGoal
              }
            >
              <div className="form-group">
                <label>
                  Nome da meta
                </label>

                <input
                  type="text"
                  placeholder="Ex: Comprar notebook"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>
                  Categoria
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                >
                  {goalCategories.map(
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

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Valor da meta
                  </label>

                  <div className="money-input">
                    <span>R$</span>

                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={target}
                      onChange={(
                        event
                      ) =>
                        setTarget(
                          event.target
                            .value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Valor inicial
                  </label>

                  <div className="money-input">
                    <span>R$</span>

                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={
                        initialValue
                      }
                      onChange={(
                        event
                      ) =>
                        setInitialValue(
                          event.target
                            .value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setIsCreatingGoal(
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
                  Criar meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          MODAL ADICIONAR VALOR
      ========================= */}

      {selectedGoal && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setSelectedGoal(null)
          }
        >
          <div
            className="transaction-modal goal-deposit-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  Adicionar valor
                </h2>

                <p>
                  Adicione dinheiro à meta{" "}
                  <strong>
                    {selectedGoal.name}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedGoal(null)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleDeposit
              }
            >
              <div className="goal-deposit-summary">
                <div>
                  <span>
                    Acumulado
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedGoal.saved
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Objetivo
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedGoal.target
                    )}
                  </strong>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Valor para adicionar
                </label>

                <div className="money-input">
                  <span>R$</span>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={depositValue}
                    onChange={(event) =>
                      setDepositValue(
                        event.target.value
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
                    setSelectedGoal(null)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="save-transaction-button"
                >
                  Adicionar valor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Goals;
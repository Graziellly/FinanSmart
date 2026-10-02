import { useMemo, useState } from "react";

import {
  FaRobot,
  FaPaperPlane,
  FaWallet,
  FaArrowTrendDown,
  FaChartPie,
  FaLightbulb,
  FaShieldHalved,
} from "react-icons/fa6";

import type { Transaction } from "./Transactions";

interface AssistantProps {
  transactions: Transaction[];
  initialBalance: number;
  userName?: string | null;
}

interface Message {
  id: number;
  type: "assistant" | "user";
  text: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function Assistant({
  transactions,
  initialBalance,
  userName,
}: AssistantProps) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "assistant",
      text:
        "Olá! Sou o assistente financeiro do FinanSmart. " +
        "Posso ajudar você a entender melhor suas movimentações.",
    },
  ]);

  /* =========================
     DADOS FINANCEIROS
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

  const totalExpenses = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  }, [transactions]);

  const balance =
    initialBalance +
    totalIncome -
    totalExpenses;

  /* =========================
     CATEGORIA COM MAIOR GASTO
  ========================= */

  const highestExpenseCategory = useMemo(() => {
    const categories: Record<string, number> = {};

    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {
        categories[transaction.category] =
          (categories[transaction.category] || 0) +
          transaction.amount;
      });

    const sorted = Object.entries(categories).sort(
      (a, b) => b[1] - a[1]
    );

    if (sorted.length === 0) {
      return null;
    }

    return {
      category: sorted[0][0],
      amount: sorted[0][1],
    };
  }, [transactions]);

  /* =========================
     ANÁLISE FINANCEIRA AUTOMÁTICA
  ========================= */

  const financialAnalysis = useMemo(() => {
    if (transactions.length === 0) {
      return {
        title: "Comece registrando suas movimentações",
        message:
          "Adicione suas entradas e despesas para receber análises automáticas.",
      };
    }

    if (totalExpenses === 0) {
      return {
        title: "Nenhuma despesa cadastrada",
        message:
          "Você ainda não possui despesas registradas no FinanSmart.",
      };
    }

    const difference =
      totalIncome - totalExpenses;

    const expensePercentage =
      totalIncome > 0
        ? (totalExpenses / totalIncome) * 100
        : 100;

    const highestCategoryPercentage =
      highestExpenseCategory
        ? (highestExpenseCategory.amount /
            totalExpenses) *
          100
        : 0;

    if (totalExpenses > totalIncome) {
      return {
        title: "Atenção aos seus gastos",
        message:
          `Suas despesas estão ${formatCurrency(
            Math.abs(difference)
          )} acima das suas entradas. ` +
          "Vale revisar seus principais gastos.",
      };
    }

    if (
      highestExpenseCategory &&
      highestCategoryPercentage >= 50
    ) {
      return {
        title: "Categoria em destaque",
        message:
          `${highestExpenseCategory.category} representa ` +
          `${highestCategoryPercentage.toFixed(
            0
          )}% das suas despesas. ` +
          "Vale acompanhar essa categoria com atenção.",
      };
    }

    if (expensePercentage >= 80) {
      return {
        title: "Margem financeira pequena",
        message:
          `Suas despesas representam ${expensePercentage.toFixed(
            0
          )}% das suas entradas. ` +
          "Sua margem financeira está ficando menor.",
      };
    }

    return {
      title: "Finanças equilibradas",
      message:
        `Suas entradas estão ${formatCurrency(
          difference
        )} acima das suas despesas cadastradas.`,
    };
  }, [
    transactions,
    totalIncome,
    totalExpenses,
    highestExpenseCategory,
  ]);

  /* =========================
     RESPOSTAS LOCAIS
     IA REAL SERÁ CONECTADA DEPOIS
  ========================= */

  function getLocalResponse(question: string) {
    const normalized = question
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions =
      transactions.filter((transaction) => {
        const transactionDate = new Date(
          `${transaction.date}T12:00:00`
        );

        return (
          transactionDate.getMonth() ===
            currentMonth &&
          transactionDate.getFullYear() ===
            currentYear
        );
      });

    const currentMonthExpenses =
      currentMonthTransactions
        .filter(
          (transaction) =>
            transaction.type === "expense"
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        );

    const currentMonthIncome =
      currentMonthTransactions
        .filter(
          (transaction) =>
            transaction.type === "income"
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        );

    const expenseTransactions =
      transactions.filter(
        (transaction) =>
          transaction.type === "expense"
      );

    const highestExpense =
      expenseTransactions.length > 0
        ? expenseTransactions.reduce(
            (highest, transaction) =>
              transaction.amount >
              highest.amount
                ? transaction
                : highest
          )
        : null;

    /* =========================
       GASTOS DESTE MÊS
    ========================= */

    if (
      normalized.includes("gastei este mes") ||
      normalized.includes("gasto este mes") ||
      normalized.includes("gastos deste mes") ||
      normalized.includes(
        "despesas deste mes"
      ) ||
      normalized.includes(
        "quanto gastei no mes"
      )
    ) {
      return `Neste mês, você gastou ${formatCurrency(
        currentMonthExpenses
      )}.`;
    }

    /* =========================
       ENTRADAS DESTE MÊS
    ========================= */

    if (
      normalized.includes("recebi este mes") ||
      normalized.includes(
        "entradas deste mes"
      ) ||
      normalized.includes(
        "entrada deste mes"
      ) ||
      normalized.includes(
        "quanto recebi no mes"
      )
    ) {
      return `Neste mês, você recebeu ${formatCurrency(
        currentMonthIncome
      )} em entradas.`;
    }

    /* =========================
       MAIOR DESPESA
    ========================= */

    if (
      normalized.includes("maior despesa") ||
      normalized.includes("maior compra") ||
      normalized.includes(
        "transacao mais cara"
      ) ||
      normalized.includes("maior transacao")
    ) {
      if (!highestExpense) {
        return (
          "Você ainda não possui despesas " +
          "cadastradas."
        );
      }

      return `Sua maior despesa cadastrada foi "${
        highestExpense.description
      }", no valor de ${formatCurrency(
        highestExpense.amount
      )}, na categoria ${
        highestExpense.category
      }.`;
    }

    /* =========================
       CATEGORIA COM MAIOR GASTO
    ========================= */

    if (
      normalized.includes("categoria") ||
      normalized.includes("gasto mais") ||
      normalized.includes("gasto maior") ||
      normalized.includes("maior gasto") ||
      normalized.includes(
        "onde gasto mais"
      ) ||
      normalized.includes(
        "onde estou gastando mais"
      )
    ) {
      if (!highestExpenseCategory) {
        return (
          "Você ainda não possui despesas " +
          "suficientes para analisar os gastos " +
          "por categoria."
        );
      }

      return `A categoria em que você mais gasta é ${
        highestExpenseCategory.category
      }, com um total de ${formatCurrency(
        highestExpenseCategory.amount
      )}.`;
    }

    /* =========================
       QUANTIDADE DE TRANSAÇÕES
    ========================= */

    if (
      normalized.includes(
        "quantas transacoes"
      ) ||
      normalized.includes(
        "quantos lancamentos"
      ) ||
      normalized.includes(
        "quantas movimentacoes"
      )
    ) {
      if (transactions.length === 0) {
        return (
          "Você ainda não possui transações " +
          "cadastradas."
        );
      }

      return `Você possui ${
        transactions.length
      } ${
        transactions.length === 1
          ? "transação cadastrada"
          : "transações cadastradas"
      }.`;
    }

    /* =========================
       ENTRADAS X DESPESAS
    ========================= */

    if (
      normalized.includes(
        "gastando mais do que recebo"
      ) ||
      normalized.includes(
        "gasto mais do que recebo"
      ) ||
      normalized.includes(
        "gastei mais do que recebi"
      ) ||
      normalized.includes(
        "despesas maiores que entradas"
      ) ||
      normalized.includes(
        "entradas maiores que despesas"
      )
    ) {
      if (
        totalIncome === 0 &&
        totalExpenses === 0
      ) {
        return (
          "Você ainda não possui movimentações " +
          "suficientes para fazer essa comparação."
        );
      }

      if (totalExpenses > totalIncome) {
        const difference =
          totalExpenses - totalIncome;

        return `Sim. Suas despesas estão ${formatCurrency(
          difference
        )} acima das suas entradas cadastradas.`;
      }

      if (totalIncome > totalExpenses) {
        const difference =
          totalIncome - totalExpenses;

        return `Não. Suas entradas estão ${formatCurrency(
          difference
        )} acima das suas despesas cadastradas.`;
      }

      return (
        "Suas entradas e despesas cadastradas " +
        `estão iguais: ${formatCurrency(
          totalIncome
        )}.`
      );
    }

    /* =========================
       SALDO
    ========================= */

    if (
      normalized.includes("saldo") ||
      normalized.includes("quanto tenho") ||
      normalized.includes(
        "dinheiro tenho"
      ) ||
      normalized.includes(
        "quanto dinheiro tenho"
      )
    ) {
      return `Seu saldo disponível atualmente é ${formatCurrency(
        balance
      )}.`;
    }

    /* =========================
       TOTAL DE ENTRADAS
    ========================= */

    if (
      normalized.includes("entrada") ||
      normalized.includes("recebi") ||
      normalized.includes("receita")
    ) {
      return `Você possui ${formatCurrency(
        totalIncome
      )} em entradas cadastradas.`;
    }

    /* =========================
       TOTAL DE DESPESAS
    ========================= */

    if (
      normalized.includes("despesa") ||
      normalized.includes("gastei") ||
      normalized.includes("gasto")
    ) {
      return `Você possui ${formatCurrency(
        totalExpenses
      )} em despesas cadastradas.`;
    }

    /* =========================
       AJUDA
    ========================= */

    if (
      normalized.includes(
        "o que voce faz"
      ) ||
      normalized.includes(
        "o que posso perguntar"
      ) ||
      normalized.includes("ajuda")
    ) {
      return (
        "Posso consultar seu saldo, entradas, " +
        "despesas, gastos deste mês, entradas " +
        "deste mês, maior despesa, categoria " +
        "com maior gasto, quantidade de transações " +
        "e comparar suas entradas com suas despesas."
      );
    }

    /* =========================
       OUTRAS PERGUNTAS
    ========================= */

    return (
      "Ainda não consigo responder essa pergunta. " +
      "Por enquanto, posso analisar saldo, entradas, " +
      "despesas, gastos mensais, maior despesa e " +
      "categorias. A inteligência artificial completa " +
      "será adicionada futuramente."
    );
  }

  /* =========================
     ENVIAR MENSAGEM
  ========================= */

  function handleSendMessage(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: cleanMessage,
    };

    const assistantMessage: Message = {
      id: Date.now() + 1,
      type: "assistant",
      text: getLocalResponse(cleanMessage),
    };

    setMessages((current) => [
      ...current,
      userMessage,
      assistantMessage,
    ]);

    setMessage("");
  }

  function sendSuggestion(question: string) {
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: question,
    };

    const assistantMessage: Message = {
      id: Date.now() + 1,
      type: "assistant",
      text: getLocalResponse(question),
    };

    setMessages((current) => [
      ...current,
      userMessage,
      assistantMessage,
    ]);
  }

  const firstName =
    userName?.trim().split(" ")[0] || "";

  return (
    <main className="assistant-page">
      {/* CABEÇALHO */}

      <header className="assistant-header">
        <div>
          <h1>Assistente Financeiro</h1>

          <p>
            Consulte seus dados financeiros de
            forma simples.
          </p>
        </div>

        <div className="assistant-status">
          <span />
          Assistente ativo
        </div>
      </header>

      {/* CONTEÚDO */}

      <section className="assistant-layout">
        {/* CHAT */}

        <article className="assistant-chat-card">
          <div className="assistant-chat-header">
            <div className="assistant-avatar">
              <FaRobot />
            </div>

            <div>
              <strong>
                FinanSmart Assistente
              </strong>

              <span>Análise financeira</span>
            </div>
          </div>

          <div className="assistant-messages">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`assistant-message-row ${item.type}`}
              >
                {item.type === "assistant" && (
                  <div className="assistant-message-avatar">
                    <FaRobot />
                  </div>
                )}

                <div
                  className={`assistant-message ${item.type}`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          {/* SUGESTÕES */}

          <div className="assistant-suggestions">
            <button
              type="button"
              onClick={() =>
                sendSuggestion(
                  "Qual é o meu saldo?"
                )
              }
            >
              Qual é meu saldo?
            </button>

            <button
              type="button"
              onClick={() =>
                sendSuggestion(
                  "Quanto gastei?"
                )
              }
            >
              Quanto gastei?
            </button>

            <button
              type="button"
              onClick={() =>
                sendSuggestion(
                  "Em qual categoria gasto mais?"
                )
              }
            >
              Onde gasto mais?
            </button>

            <button
              type="button"
              onClick={() =>
                sendSuggestion(
                  "Quanto gastei este mês?"
                )
              }
            >
              Gastos deste mês
            </button>

            <button
              type="button"
              onClick={() =>
                sendSuggestion(
                  "Quanto recebi este mês?"
                )
              }
            >
              Entradas deste mês
            </button>

            <button
              type="button"
              onClick={() =>
                sendSuggestion(
                  "Qual foi minha maior despesa?"
                )
              }
            >
              Maior despesa
            </button>

            <button
              type="button"
              onClick={() =>
                sendSuggestion(
                  "Quantas transações tenho?"
                )
              }
            >
              Quantas transações?
            </button>

            <button
              type="button"
              onClick={() =>
                sendSuggestion(
                  "Estou gastando mais do que recebo?"
                )
              }
            >
              Entradas x despesas
            </button>
          </div>

          {/* INPUT */}

          <form
            className="assistant-input-area"
            onSubmit={handleSendMessage}
          >
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder="Pergunte sobre suas finanças..."
            />

            <button
              type="submit"
              aria-label="Enviar mensagem"
            >
              <FaPaperPlane />
            </button>
          </form>
        </article>

        {/* PAINEL LATERAL */}

        <aside className="assistant-side">
          <article className="assistant-side-card">
            <div className="assistant-side-heading">
              <FaWallet />

              <div>
                <span>Saldo disponível</span>

                <strong>
                  {formatCurrency(balance)}
                </strong>
              </div>
            </div>
          </article>

          <article className="assistant-side-card">
            <div className="assistant-side-heading">
              <FaArrowTrendDown />

              <div>
                <span>Total de despesas</span>

                <strong>
                  {formatCurrency(
                    totalExpenses
                  )}
                </strong>
              </div>
            </div>
          </article>

          {/* ANÁLISE AUTOMÁTICA */}

          <article className="assistant-analysis-card">
            <div className="assistant-analysis-title">
              <FaChartPie />

              <h3>Análise rápida</h3>
            </div>

            {transactions.length === 0 ? (
              <>
                <strong>
                  {financialAnalysis.title}
                </strong>

                <p>
                  {firstName
                    ? `${firstName}, `
                    : ""}
                  {financialAnalysis.message}
                </p>
              </>
            ) : (
              <>
                <p>
                  Você possui{" "}
                  <strong>
                    {formatCurrency(
                      totalIncome
                    )}
                  </strong>{" "}
                  em entradas e{" "}
                  <strong>
                    {formatCurrency(
                      totalExpenses
                    )}
                  </strong>{" "}
                  em despesas.
                </p>

                <p>
                  <strong>
                    {financialAnalysis.title}
                  </strong>
                </p>

                <p>
                  {financialAnalysis.message}
                </p>
              </>
            )}
          </article>

          {/* DICA */}

          <article className="assistant-info-card">
            <FaLightbulb />

            <div>
              <strong>Dica</strong>

              <p>
                Mantenha suas movimentações
                atualizadas para obter análises
                mais precisas.
              </p>
            </div>
          </article>

          {/* SEGURANÇA */}

          <div className="assistant-security">
            <FaShieldHalved />

            <span>
              Seus dados financeiros permanecem
              associados à sua conta.
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Assistant;
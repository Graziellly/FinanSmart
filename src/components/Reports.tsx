import { useMemo } from "react";

import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaWallet,
  FaChartColumn,
  FaUtensils,
  FaCar,
  FaHouse,
  FaWifi,
  FaHeartPulse,
  FaGraduationCap,
  FaCartShopping,
  FaGamepad,
  FaCreditCard,
} from "react-icons/fa6";

import type { Transaction } from "./Transactions";

interface ReportsProps {
  transactions: Transaction[];
  initialBalance: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

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
      return <FaCreditCard />;
  }
}

function Reports({
  transactions,
  initialBalance,
}: ReportsProps) {
  /* =========================
     RESUMO GERAL
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

  const currentBalance =
    initialBalance +
    totalIncome -
    totalExpenses;

  const movementResult =
    totalIncome - totalExpenses;

  /* =========================
     GASTOS POR CATEGORIA
  ========================= */

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};

    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {
        totals[transaction.category] =
          (totals[transaction.category] || 0) +
          transaction.amount;
      });

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalExpenses > 0
            ? (amount / totalExpenses) * 100
            : 0,
      }))
      .sort(
        (a, b) =>
          b.amount - a.amount
      );
  }, [
    transactions,
    totalExpenses,
  ]);

  /* =========================
     ÚLTIMOS 6 MESES
  ========================= */

  const monthlyData = useMemo(() => {
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
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - 5 + index,
          1
        );

        const year =
          date.getFullYear();

        const month =
          date.getMonth();

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
              transactionYear === year &&
              transactionMonth - 1 === month
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
          label: monthNames[month],
          income,
          expense,
          result: income - expense,
        };
      }
    );
  }, [transactions]);

  const maxMonthlyValue =
    Math.max(
      ...monthlyData.flatMap(
        (month) => [
          month.income,
          month.expense,
        ]
      ),
      1
    );

  const hasTransactions =
    transactions.length > 0;

  return (
    <main className="reports-page">
      {/* CABEÇALHO */}

      <header className="reports-header">
        <div>
          <h1>Relatórios</h1>

          <p>
            Analise suas movimentações e
            acompanhe sua evolução
            financeira.
          </p>
        </div>
      </header>

      {/* RESUMO */}

      <section className="reports-summary-grid">
        <article className="report-summary-card">
          <div className="report-summary-icon balance">
            <FaWallet />
          </div>

          <div>
            <span>
              Saldo disponível
            </span>

            <strong>
              {formatCurrency(
                currentBalance
              )}
            </strong>

            <p>
              Saldo atual da conta
            </p>
          </div>
        </article>

        <article className="report-summary-card">
          <div className="report-summary-icon income">
            <FaArrowTrendUp />
          </div>

          <div>
            <span>
              Total de entradas
            </span>

            <strong>
              {formatCurrency(
                totalIncome
              )}
            </strong>

            <p>
              Valores recebidos
            </p>
          </div>
        </article>

        <article className="report-summary-card">
          <div className="report-summary-icon expense">
            <FaArrowTrendDown />
          </div>

          <div>
            <span>
              Total de despesas
            </span>

            <strong>
              {formatCurrency(
                totalExpenses
              )}
            </strong>

            <p>
              Valores gastos
            </p>
          </div>
        </article>

        <article className="report-summary-card">
          <div
            className={`report-summary-icon ${
              movementResult >= 0
                ? "income"
                : "expense"
            }`}
          >
            <FaChartColumn />
          </div>

          <div>
            <span>
              Resultado
            </span>

            <strong>
              {formatCurrency(
                movementResult
              )}
            </strong>

            <p>
              Entradas menos despesas
            </p>
          </div>
        </article>
      </section>

      {/* CONTEÚDO */}

      <section className="reports-content-grid">
        {/* EVOLUÇÃO MENSAL */}

        <article className="report-card monthly-report">
          <div className="report-card-heading">
            <div>
              <h2>
                Evolução financeira
              </h2>

              <p>
                Entradas e despesas dos
                últimos 6 meses.
              </p>
            </div>
          </div>

          {!hasTransactions ? (
            <div className="report-empty">
              <FaChartColumn />

              <h3>
                Nenhuma movimentação
              </h3>

              <p>
                O relatório será
                preenchido quando você
                cadastrar suas
                transações.
              </p>
            </div>
          ) : (
            <div className="monthly-chart">
              {monthlyData.map(
                (month) => (
                  <div
                    className="monthly-chart-column"
                    key={month.label}
                  >
                    <div className="monthly-bars">
                      <div
                        className="monthly-bar income"
                        title={`Entradas: ${formatCurrency(
                          month.income
                        )}`}
                        style={{
                          height: `${
                            (month.income /
                              maxMonthlyValue) *
                            100
                          }%`,
                        }}
                      />

                      <div
                        className="monthly-bar expense"
                        title={`Despesas: ${formatCurrency(
                          month.expense
                        )}`}
                        style={{
                          height: `${
                            (month.expense /
                              maxMonthlyValue) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <span>
                      {month.label}
                    </span>
                  </div>
                )
              )}
            </div>
          )}

          <div className="report-chart-legend">
            <div>
              <span className="report-legend-dot income" />
              Entradas
            </div>

            <div>
              <span className="report-legend-dot expense" />
              Despesas
            </div>
          </div>
        </article>

        {/* CATEGORIAS */}

        <article className="report-card categories-report">
          <div className="report-card-heading">
            <div>
              <h2>
                Gastos por categoria
              </h2>

              <p>
                Onde seu dinheiro está
                sendo utilizado.
              </p>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="report-empty small">
              <FaWallet />

              <h3>
                Nenhuma despesa
              </h3>

              <p>
                As categorias aparecerão
                aqui quando houver
                despesas.
              </p>
            </div>
          ) : (
            <div className="report-category-list">
              {categoryData.map(
                (item) => (
                  <div
                    className="report-category-item"
                    key={item.category}
                  >
                    <div className="report-category-top">
                      <div className="report-category-name">
                        <div className="report-category-icon">
                          {getCategoryIcon(
                            item.category
                          )}
                        </div>

                        <div>
                          <strong>
                            {item.category}
                          </strong>

                          <span>
                            {item.percentage.toFixed(
                              0
                            )}
                            % das despesas
                          </span>
                        </div>
                      </div>

                      <strong>
                        {formatCurrency(
                          item.amount
                        )}
                      </strong>
                    </div>

                    <div className="report-category-progress">
                      <div
                        style={{
                          width: `${Math.min(
                            item.percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </article>
      </section>

      {/* RESUMO MENSAL */}

      <section className="report-card report-table-card">
        <div className="report-card-heading">
          <div>
            <h2>
              Resumo mensal
            </h2>

            <p>
              Comparativo das suas
              movimentações nos últimos
              meses.
            </p>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Entradas</th>
                <th>Despesas</th>
                <th>Resultado</th>
              </tr>
            </thead>

            <tbody>
              {monthlyData.map(
                (month) => (
                  <tr key={month.label}>
                    <td>
                      {month.label}
                    </td>

                    <td className="report-income-value">
                      {formatCurrency(
                        month.income
                      )}
                    </td>

                    <td className="report-expense-value">
                      {formatCurrency(
                        month.expense
                      )}
                    </td>

                    <td
                      className={
                        month.result >= 0
                          ? "report-income-value"
                          : "report-expense-value"
                      }
                    >
                      {formatCurrency(
                        month.result
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Reports;
import { useMemo, useState } from "react";

import {
  FaArrowDown,
  FaArrowUp,
  FaMagnifyingGlass,
  FaPlus,
  FaPen,
  FaTrash,
  FaSliders,
} from "react-icons/fa6";

export interface Transaction {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
}

interface TransactionsProps {
  transactions: Transaction[];
  onNewTransaction: () => void;
  onDeleteTransaction: (id: number) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string) {
  const [year, month, day] =
    date.split("-");

  return `${day}/${month}/${year}`;
}

function Transactions({
  transactions,
  onNewTransaction,
  onDeleteTransaction,
  onEditTransaction,
}: TransactionsProps) {
  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          const searchText =
            search
              .trim()
              .toLowerCase();

          const matchesSearch =
            transaction.description
              .toLowerCase()
              .includes(searchText) ||
            transaction.category
              .toLowerCase()
              .includes(searchText);

          const matchesType =
            typeFilter === "all" ||
            transaction.type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );
    }, [
      transactions,
      search,
      typeFilter,
    ]);

  const totalIncome =
    useMemo(() => {
      return transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "income"
        )
        .reduce(
          (total, transaction) =>
            total +
            transaction.amount,
          0
        );
    }, [transactions]);

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

  return (
    <main className="transactions-page">
      <header className="transactions-header">
        <div>
          <h1>Transações</h1>

          <p>
            Acompanhe todas as
            movimentações da sua conta.
          </p>
        </div>

        <button
          className="add-transaction-button"
          onClick={onNewTransaction}
        >
          <FaPlus />
          Nova transação
        </button>
      </header>

      <section className="transactions-summary">
        <article className="transaction-summary-card">
          <div className="transaction-summary-icon income">
            <FaArrowUp />
          </div>

          <div>
            <span>
              Total de receitas
            </span>

            <strong>
              {formatCurrency(
                totalIncome
              )}
            </strong>
          </div>
        </article>

        <article className="transaction-summary-card">
          <div className="transaction-summary-icon expense">
            <FaArrowDown />
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
          </div>
        </article>

        <article className="transaction-summary-card">
          <div className="transaction-summary-icon balance">
            <FaSliders />
          </div>

          <div>
            <span>Saldo atual</span>

            <strong>
              {formatCurrency(
                totalIncome -
                  totalExpenses
              )}
            </strong>
          </div>
        </article>
      </section>

      <section className="transactions-container">
        <div className="transactions-toolbar">
          <div className="transaction-search">
            <FaMagnifyingGlass />

            <input
              type="text"
              placeholder="Buscar transação..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <select
            className="transaction-filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              Todas as transações
            </option>

            <option value="income">
              Receitas
            </option>

            <option value="expense">
              Despesas
            </option>
          </select>
        </div>

        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="no-transactions"
                  >
                    Nenhuma transação
                    encontrada.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(
                  (transaction) => (
                    <tr
                      key={
                        transaction.id
                      }
                    >
                      <td>
                        <div className="table-description">
                          <div
                            className={`table-transaction-icon ${
                              transaction.type ===
                              "income"
                                ? "income"
                                : "expense"
                            }`}
                          >
                            {transaction.type ===
                            "income" ? (
                              <FaArrowUp />
                            ) : (
                              <FaArrowDown />
                            )}
                          </div>

                          <strong>
                            {
                              transaction.description
                            }
                          </strong>
                        </div>
                      </td>

                      <td>
                        <span className="category-badge">
                          {
                            transaction.category
                          }
                        </span>
                      </td>

                      <td className="table-date">
                        {formatDate(
                          transaction.date
                        )}
                      </td>

                      <td>
                        <span
                          className={`transaction-type-badge ${transaction.type}`}
                        >
                          {transaction.type ===
                          "income"
                            ? "Receita"
                            : "Despesa"}
                        </span>
                      </td>

                      <td
                        className={
                          transaction.type ===
                          "income"
                            ? "table-income"
                            : "table-expense"
                        }
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}{" "}
                        {formatCurrency(
                          transaction.amount
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                         <button
                        className="edit-transaction"
                        title="Editar"
                        onClick={() =>
                        onEditTransaction(transaction)
                        }
                        >
                        <FaPen />
                        </button>

                          <button
                            className="delete-transaction"
                            title="Excluir"
                            onClick={() =>
                              onDeleteTransaction(
                                transaction.id
                              )
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Transactions;
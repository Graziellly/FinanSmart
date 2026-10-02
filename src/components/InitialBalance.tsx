import { useState } from "react";

import {
  FaWallet,
  FaArrowRight,
  FaChartLine,
} from "react-icons/fa6";

interface InitialBalanceProps {
  userName?: string | null;
  onSave: (balance: number) => void;
}

function InitialBalance({
  userName,
  onSave,
}: InitialBalanceProps) {
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const numericBalance = Number(
      balance
        .replace(/\./g, "")
        .replace(",", ".")
    );

    if (
      balance.trim() === "" ||
      Number.isNaN(numericBalance) ||
      numericBalance < 0
    ) {
      setError(
        "Informe um saldo inicial válido."
      );

      return;
    }

    onSave(numericBalance);
  }

  const firstName =
    userName?.trim().split(" ")[0] ||
    "Olá";

  return (
    <main className="initial-balance-page">
      <section className="initial-balance-card">
        <div className="initial-balance-logo">
          <div>
            <FaChartLine />
          </div>

          <span>FinanSmart</span>
        </div>

        <div className="initial-balance-icon">
          <FaWallet />
        </div>

        <div className="initial-balance-heading">
          <span>
            CONFIGURAÇÃO INICIAL
          </span>

          <h1>
            {firstName}, vamos começar?
          </h1>

          <p>
            Informe quanto dinheiro você possui
            atualmente. Esse será o ponto de
            partida para o FinanSmart calcular
            seu saldo.
          </p>
        </div>

        <form
          className="initial-balance-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="initial-balance">
            Seu saldo atual
          </label>

          <div className="initial-balance-input">
            <span>R$</span>

            <input
              id="initial-balance"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={balance}
              onChange={(event) =>
                setBalance(event.target.value)
              }
              autoFocus
            />
          </div>

          <p className="initial-balance-help">
            Exemplo: se você possui R$ 2.500
            atualmente, informe 2.500,00.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="initial-balance-button"
          >
            Começar a usar o FinanSmart

            <FaArrowRight />
          </button>
        </form>

        <div className="initial-balance-info">
          <strong>
            Como funciona?
          </strong>

          <p>
            Depois disso, seu saldo será
            atualizado automaticamente conforme
            você cadastrar entradas e despesas.
          </p>
        </div>
      </section>
    </main>
  );
}

export default InitialBalance;
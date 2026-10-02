import { useState } from "react";
import { FaXmark } from "react-icons/fa6";

export type TransactionType = "income" | "expense";

export interface TransactionFormData {
  description: string;
  category: string;
  amount: number;
  date: string;
  type: TransactionType;
}

interface TransactionModalProps {
  onClose: () => void;
  onSave: (transaction: TransactionFormData) => void;

  initialData?: TransactionFormData | null;
}

function TransactionModal({
  onClose,
  onSave,
  initialData,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(
    initialData?.type ?? "expense"
  );

  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  const [category, setCategory] = useState(
    initialData?.category ?? "Alimentação"
  );

  const [amount, setAmount] = useState(
    initialData
      ? initialData.amount
          .toFixed(2)
          .replace(".", ",")
      : ""
  );

  const [date, setDate] = useState(
    initialData?.date ??
      new Date().toISOString().split("T")[0]
  );

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const numericAmount = Number(
      amount
        .replace(/\./g, "")
        .replace(",", ".")
    );

    if (!description.trim()) {
      alert("Digite uma descrição.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    onSave({
      description: description.trim(),
      category,
      amount: numericAmount,
      date,
      type,
    });

    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="transaction-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <h2>
              {initialData
                ? "Editar transação"
                : "Nova transação"}
            </h2>

            <p>
              {initialData
                ? "Atualize os dados da movimentação."
                : "Adicione uma movimentação à sua conta."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <FaXmark />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo</label>

            <div className="transaction-type-selector">
              <button
                type="button"
                className={`type-button ${
                  type === "expense"
                    ? "expense-selected"
                    : ""
                }`}
                onClick={() =>
                  setType("expense")
                }
              >
                Despesa
              </button>

              <button
                type="button"
                className={`type-button ${
                  type === "income"
                    ? "income-selected"
                    : ""
                }`}
                onClick={() =>
                  setType("income")
                }
              >
                Receita
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Descrição
            </label>

            <input
              id="description"
              type="text"
              placeholder="Ex: Supermercado"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">
              Categoria
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >
              <option>Alimentação</option>
              <option>Moradia</option>
              <option>Transporte</option>
              <option>Contas</option>
              <option>Compras</option>
              <option>Saúde</option>
              <option>Educação</option>
              <option>Lazer</option>
              <option>Salário</option>
              <option>Investimentos</option>
              <option>Outros</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">
                Valor
              </label>

              <div className="money-input">
                <span>R$</span>

                <input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date">
                Data
              </label>

              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="save-transaction-button"
            >
              {initialData
                ? "Salvar alterações"
                : "Salvar transação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
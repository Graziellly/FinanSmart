const {setGlobalOptions} = require("firebase-functions/v2");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const OpenAI = require("openai");

setGlobalOptions({
  maxInstances: 10,
  region: "southamerica-east1",
});

const openaiApiKey = defineSecret("OPENAI_API_KEY");

exports.financialAssistant = onCall(
    {
      secrets: [openaiApiKey],
    },
    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Você precisa estar autenticado."
        );
      }

      const {
        question,
        initialBalance = 0,
        transactions = [],
      } = request.data || {};

      if (
        typeof question !== "string" ||
        !question.trim()
      ) {
        throw new HttpsError(
            "invalid-argument",
            "Digite uma pergunta para o assistente."
        );
      }

      if (!Array.isArray(transactions)) {
        throw new HttpsError(
            "invalid-argument",
            "As transações são inválidas."
        );
      }

      if (transactions.length > 500) {
        throw new HttpsError(
            "invalid-argument",
            "Há transações demais para uma única análise."
        );
      }

      const safeTransactions = transactions.map((transaction) => ({
        description: String(transaction.description || "").slice(0, 100),
        category: String(transaction.category || "").slice(0, 50),
        amount: Number(transaction.amount) || 0,
        date: String(transaction.date || "").slice(0, 20),
        type:
          transaction.type === "income" ?
            "income" :
            "expense",
      }));

      const totalIncome = safeTransactions
          .filter((transaction) => transaction.type === "income")
          .reduce((total, transaction) => total + transaction.amount, 0);

      const totalExpenses = safeTransactions
          .filter((transaction) => transaction.type === "expense")
          .reduce((total, transaction) => total + transaction.amount, 0);

      const currentBalance =
        Number(initialBalance || 0) +
        totalIncome -
        totalExpenses;

      const client = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

      try {
        const response = await client.responses.create({
          model: "gpt-5-mini",

          instructions: `
Você é o assistente financeiro do aplicativo FinanSmart.

Responda sempre em português do Brasil.

Sua função é ajudar o usuário a compreender os próprios dados
financeiros fornecidos pelo FinanSmart.

Seja claro, objetivo, amigável e profissional.

Use os dados financeiros fornecidos para responder perguntas sobre:
- saldo;
- entradas;
- despesas;
- categorias;
- organização financeira;
- padrões de gastos;
- planejamento.

Não invente transações, valores ou informações que não estejam
nos dados fornecidos.

Quando não houver dados suficientes, diga isso claramente.

Não diga que uma resposta constitui aconselhamento financeiro
profissional.

Valores monetários devem ser apresentados em reais (R$).
          `,

          input: `
DADOS FINANCEIROS DO USUÁRIO

Saldo inicial:
R$ ${Number(initialBalance || 0).toFixed(2)}

Total de entradas:
R$ ${totalIncome.toFixed(2)}

Total de despesas:
R$ ${totalExpenses.toFixed(2)}

Saldo atual:
R$ ${currentBalance.toFixed(2)}

Transações:
${JSON.stringify(safeTransactions)}

PERGUNTA DO USUÁRIO:
${question.trim()}
          `,
        });

        const answer = response.output_text?.trim();

        if (!answer) {
          throw new Error("A IA não retornou uma resposta.");
        }

        return {
          answer,
        };
      } catch (error) {
        console.error("Erro no assistente financeiro:", error);

        throw new HttpsError(
            "internal",
            "Não foi possível obter uma resposta da IA."
        );
      }
    }
);
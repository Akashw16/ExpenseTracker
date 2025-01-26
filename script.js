const transactionForm = document.getElementById("transaction-form");
const transactionsList = document.getElementById("transactions");
const totalIncomeElement = document.getElementById("total-income");
const totalExpensesElement = document.getElementById("total-expenses");
const netIncomeElement = document.getElementById("net-income");
const errorMessage = document.getElementById("error-message");
const filterSelect = document.getElementById("filter");
const chartCanvas = document.getElementById("expense-chart");

let transactions = [];

// Add Transaction
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!date || !description || !category || isNaN(amount)) {
    errorMessage.textContent = "Please fill in all fields with valid data.";
    return;
  }
  errorMessage.textContent = "";

  const transaction = { date, description, category, amount };
  transactions.push(transaction);

  updateTransactions();
  updateSummary();
  updateChart();
  transactionForm.reset();
});

// Update Transactions List
function updateTransactions() {
  transactionsList.innerHTML = "";
  transactions.forEach((transaction, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${transaction.date} - ${transaction.description} (${transaction.category}): ₹${transaction.amount.toFixed(2)}
      <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
    `;
    transactionsList.appendChild(li);
  });
}

// Update Summary
function updateSummary() {
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);

  totalIncomeElement.textContent = totalIncome.toFixed(2);
  totalExpensesElement.textContent = Math.abs(totalExpenses).toFixed(2);
  netIncomeElement.textContent = (totalIncome + totalExpenses).toFixed(2);
}

// Delete Transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  updateTransactions();
  updateSummary();
  updateChart();
}

// Update Chart
function updateChart() {
  const expenseCategories = transactions.filter((t) => t.amount < 0).reduce((categories, t) => {
    categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    return categories;
  }, {});

  const ctx = chartCanvas.getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(expenseCategories),
      datasets: [
        {
          data: Object.values(expenseCategories),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
        },
      ],
    },
  });
}

// Initial Setup
updateSummary();
updateChart();

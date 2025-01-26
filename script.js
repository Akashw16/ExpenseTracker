const form = document.getElementById('transaction-form');
const dateInput = document.getElementById('date');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const transactionsList = document.getElementById('transactions');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const netIncomeEl = document.getElementById('net-income');
const filterInput = document.getElementById('filter');
let transactions = [];

// Local Storage
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Load Local Storage
function loadFromLocalStorage() {
  const storedTransactions = localStorage.getItem('transactions');
  if (storedTransactions) {
    transactions = JSON.parse(storedTransactions);
    updateUI();
  }
}

function updateUI() {
  transactionsList.innerHTML = '';

  const filteredTransactions = filterInput.value === 'All'
    ? transactions
    : transactions.filter((t) => t.category === filterInput.value);

  filteredTransactions.forEach((transaction, index) => {
    const li = document.createElement('li');
    li.textContent = `${transaction.date} - ${transaction.description} [${transaction.category}] : ${transaction.amount}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
      transactions.splice(index, 1);
      updateUI();
    });

    li.appendChild(deleteBtn);
    transactionsList.appendChild(li);
  });

  calculateSummary();
  updateChart();
  saveToLocalStorage();
}

//  Summary
function calculateSummary() {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  totalIncomeEl.textContent = income.toFixed(2);
  totalExpensesEl.textContent = expenses.toFixed(2);
  netIncomeEl.textContent = (income - expenses).toFixed(2);
}

// Transaction added
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const errorMessage = document.getElementById('error-message');
  if (!dateInput.value || !descriptionInput.value || !categoryInput.value || !amountInput.value) {
    errorMessage.textContent = 'All fields are required!';
    return;
  }
  errorMessage.textContent = '';

  const transaction = {
    date: dateInput.value,
    description: descriptionInput.value,
    category: categoryInput.value,
    amount: parseFloat(amountInput.value),
    type: parseFloat(amountInput.value) > 0 ? 'income' : 'expense',
  };

  transactions.push(transaction);
  updateUI();
  form.reset();
});

// Filter Transactions
filterInput.addEventListener('change', updateUI);

// Chart
function updateChart() {
  const categories = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  const ctx = document.getElementById('expense-chart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      }],
    },
  });
}

// Transactions Export
document.getElementById('export-btn').addEventListener('click', () => {
  const dataStr = JSON.stringify(transactions);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.json';
  a.click();

  URL.revokeObjectURL(url);
});

// Import Transactions
document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    transactions = JSON.parse(reader.result);
    updateUI();
  };
  reader.readAsText(file);
});

// Load data on startup
document.addEventListener('DOMContentLoaded', loadFromLocalStorage);

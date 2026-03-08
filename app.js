import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ה-Config שקיבלת
const firebaseConfig = {
  apiKey: "AIzaSyDK3oq5I-MHnjYGXkRBfUeYs3vw7zwB0gE",
  authDomain: "mymoneyapp-abb12.firebaseapp.com",
  projectId: "mymoneyapp-abb12",
  storageBucket: "mymoneyapp-abb12.firebasestorage.app",
  messagingSenderId: "728703755358",
  appId: "1:728703755358:web:e10f94bfc61ec631dcc0cf",
  measurementId: "G-2D4YL4DWQT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const transactionsCol = collection(db, "transactions");

let currentType = 'expense';
let myChart = null;

// הגדרת הכפתורים הגדולים שביקשת
document.getElementById('type-expense').onclick = () => {
    currentType = 'expense';
    document.getElementById('type-expense').classList.add('active');
    document.getElementById('type-income').classList.remove('active');
};
document.getElementById('type-income').onclick = () => {
    currentType = 'income';
    document.getElementById('type-income').classList.add('active');
    document.getElementById('type-expense').classList.remove('active');
};

// שמירה לענן
document.getElementById('add-btn').onclick = async () => {
    const desc = document.getElementById('description').value;
    const amt = parseFloat(document.getElementById('amount').value);
    const cat = document.getElementById('category').value;

    if (desc && amt) {
        await addDoc(transactionsCol, {
            description: desc,
            amount: amt,
            category: cat,
            type: currentType,
            date: Date.now()
        });
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
    }
};

// האזנה לנתונים (זה יעלים את מסך הטעינה)
onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
    const transactions = [];
    snapshot.forEach(doc => transactions.push({ id: doc.id, ...doc.data() }));
    renderUI(transactions);
});

function renderUI(data) {
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';
    let inc = 0, exp = 0;
    const catTotals = {};

    data.forEach(t => {
        if (t.type === 'income') inc += t.amount;
        else {
            exp += t.amount;
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        }

        const li = document.createElement('li');
        li.innerHTML = `${t.description} - ₪${t.amount.toLocaleString()} <button onclick="deleteDoc(doc(db, 'transactions', '${t.id}'))">🗑️</button>`;
        list.appendChild(li);
    });

    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    document.getElementById('total-balance').innerText = `₪${(inc - exp).toLocaleString()}`;
    
    // רענון הגרף
    updateChart(catTotals);
}

function updateChart(totals) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{
                data: Object.values(totals),
                backgroundColor: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#F2E2B2']
            }]
        }
    });
}
// חיבור לספריות Firebase דרך האינטרנט (CDN)
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

// אתחול האפליקציה
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const transactionsCol = collection(db, "transactions");

// משתנים לניהול הממשק
let currentType = 'expense';
let myChart = null;

// הגדרת כפתורי "הוצאה" ו"הכנסה" (הממשק החדש והידידותי)
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

// הוספת נתונים ל-Firebase (הענן של גוגל)
document.getElementById('add-btn').onclick = async () => {
    const desc = document.getElementById('description').value;
    const amt = parseFloat(document.getElementById('amount').value);
    const cat = document.getElementById('category').value;

    if (desc && !isNaN(amt)) {
        try {
            await addDoc(transactionsCol, {
                description: desc,
                amount: amt,
                category: cat,
                type: currentType,
                date: Date.now()
            });
            // איפוס שדות
            document.getElementById('description').value = '';
            document.getElementById('amount').value = '';
        } catch (e) {
            console.error("שגיאה בשמירה לענן: ", e);
        }
    } else {
        alert("נא להזין תיאור וסכום תקין");
    }
};

// האזנה לשינויים בזמן אמת - ברגע שמישהו מוסיף נתון, כולם רואים אותו!
onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
    const transactions = [];
    snapshot.forEach(doc => transactions.push({ id: doc.id, ...doc.data() }));
    renderUI(transactions);
});

// עדכון התצוגה, הגרפים והסיכומים
function renderUI(data) {
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';
    let inc = 0, exp = 0;
    const catTotals = {};

    data.forEach(t => {
        if (t.type === 'income') {
            inc += t.amount;
        } else {
            exp += t.amount;
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        }

        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;
        li.innerHTML = `
            <span class="desc">${t.description}</span>
            <span class="cat">${t.category}</span>
            <span class="amt">₪${t.amount.toLocaleString()}</span>
            <button class="delete-btn" onclick="deleteTransaction('${t.id}')">🗑️</button>
        `;
        list.appendChild(li);
    });

    // עדכון כרטיסיות הסיכום
    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    document.getElementById('total-balance').innerText = `₪${(inc - exp).toLocaleString()}`;
    
    // עדכון הגרף ופס התקציב
    updateChart(catTotals);
    updateProgressBar(exp);
}

// פונקציית מחיקה מהענן
window.deleteTransaction = async (id) => {
    if(confirm("למחוק את התנועה?")) {
        await deleteDoc(doc(db, "transactions", id));
    }
};

// עדכון גרף עוגה (Pie Chart)
function updateChart(totals) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    if (Object.keys(totals).length === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{
                data: Object.values(totals),
                backgroundColor: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#F2E2B2', '#D9B2F2'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom', labels: { font: { family: 'system-ui', size: 14 } } }
            }
        }
    });
}

// עדכון מד התקציב
function updateProgressBar(currentExpenses) {
    const limit = parseFloat(document.getElementById('budget-limit').value) || 5000;
    const percent = Math.min((currentExpenses / limit) * 100, 100);
    const bar = document.getElementById('progress-bar');
    
    bar.style.width = percent + '%';
    document.getElementById('budget-status').innerText = `${Math.round(percent)}% מהתקציב נוצל`;
    
    // שינוי צבע לאדום-פסטל אם עוברים את ה-80%
    if (percent > 80) {
        bar.style.backgroundColor = '#ff9aa2';
    } else {
        bar.style.backgroundColor = '#b2f2bb';
    }
}
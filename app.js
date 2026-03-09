import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let allData = [];

// --- קטגוריות ---
const categories = ["מזון", "בית", "חינוך", "פנאי", "רכב", "בריאות", "משכורת", "אחר"];
const categorySelect = document.getElementById('transaction-category');
categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.innerText = cat;
    categorySelect.appendChild(opt);
});

// --- כפתורי סוג ---
const btnExpense = document.getElementById('type-btn-expense');
const btnIncome = document.getElementById('type-btn-income');

btnExpense.onclick = () => { currentType = 'expense'; btnExpense.classList.add('active'); btnIncome.classList.remove('active'); };
btnIncome.onclick = () => { currentType = 'income'; btnIncome.classList.add('active'); btnExpense.classList.remove('active'); };

// --- מצב לילה ---
const darkModeBtn = document.getElementById('dark-mode-btn');
darkModeBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    darkModeBtn.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
};

// --- הוספה לענן ---
document.getElementById('transaction-form').onsubmit = async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('transaction-name');
    const amountInput = document.getElementById('transaction-amount');
    const categoryInput = document.getElementById('transaction-category');

    await addDoc(transactionsCol, {
        description: nameInput.value,
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        type: currentType,
        date: Date.now()
    });
    nameInput.value = ''; amountInput.value = '';
};

// --- האזנה לענן ---
onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
    allData = [];
    snapshot.forEach(doc => allData.push({ id: doc.id, ...doc.data() }));
    document.getElementById('app-loader').classList.add('hidden');
    renderUI(allData);
});

function renderUI(data) {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    let inc = 0, exp = 0;
    const catTotals = {};

    data.forEach(t => {
        if (t.type === 'income') inc += t.amount;
        else { 
            exp += t.amount; 
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; 
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.description}</td>
            <td><span class="badge">${t.category}</span></td>
            <td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.type === 'income' ? '↑ הכנסה' : '↓ הוצאה'}</span></td>
            <td style="font-weight:bold; color:${t.type === 'income' ? '#3a7a40' : '#c04828'}">₪${t.amount.toLocaleString()}</td>
            <td>${new Date(t.date).toLocaleDateString('he-IL')}</td>
            <td><button class="btn-delete" onclick="deleteTransaction('${t.id}')">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('total-income').innerText = `₪${inc.toLocaleString()}`;
    document.getElementById('total-expenses').innerText = `₪${exp.toLocaleString()}`;
    const balance = inc - exp;
    document.getElementById('balance').innerText = `₪${balance.toLocaleString()}`;
    
    document.getElementById('empty-state').style.display = data.length ? 'none' : 'block';
    
    updateChart(catTotals);
    updateSavingTarget(balance); // הפעלת חישוב יעד החיסכון
}

// פונקציית יעד החיסכון החדשה
function updateSavingTarget(balance) {
    const savingTarget = 8000; // היעד שלכם
    const percentage = Math.min(Math.max((balance / savingTarget) * 100, 0), 100);
    
    const progressFill = document.getElementById('target-progress-fill');
    const targetPercentText = document.getElementById('target-percentage');
    const targetMsg = document.getElementById('target-message');

    progressFill.style.width = percentage + "%";
    targetPercentText.innerText = Math.round(percentage) + "%";

    if (balance >= savingTarget) {
        targetMsg.innerText = "כל הכבוד! הגעתם ליעד החיסכון להשקעה! 🏆";
        targetMsg.style.color = "#3a7a40";
    } else if (balance > 0) {
        targetMsg.innerText = `נשאר לכם עוד ₪${(savingTarget - balance).toLocaleString()} כדי להגיע ליעד.`;
        targetMsg.style.color = "#666";
    } else {
        targetMsg.innerText = "כרגע אין יתרה לחיסכון. צמצמו הוצאות!";
        targetMsg.style.color = "#c04828";
    }
}

window.deleteTransaction = async (id) => {
    if (confirm("למחוק?")) await deleteDoc(doc(db, "transactions", id));
};

// --- ייצוא ל-PDF ו-Excel נשארים ללא שינוי ---
document.getElementById('export-pdf-btn').onclick = async () => {
    if (allData.length === 0) return alert("אין נתונים לייצוא");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const mainEl = document.querySelector('main');
    const canvas = await html2canvas(mainEl, { scale: 1.5, useCORS: true, backgroundColor: '#f2e8d8' });
    const imgData = canvas.toDataURL('image/jpeg', 0.90);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let y = 0;
    while (y < imgHeight) {
        pdf.addImage(imgData, 'JPEG', 0, -y, pdfWidth, imgHeight);
        y += pdfHeight;
        if (y < imgHeight) pdf.addPage();
    }
    pdf.save(`דוח_משפחת_טולדנו_${new Date().toLocaleDateString('he-IL')}.pdf`);
};

document.getElementById('export-excel-btn').onclick = () => {
    if (allData.length === 0) return alert("אין נתונים לייצוא");
    const excelRows = allData.map(t => ({
        "תיאור": t.description,
        "קטגוריה": t.category,
        "סוג": t.type === 'income' ? 'הכנסה' : 'הוצאה',
        "סכום": t.amount,
        "תאריך": new Date(t.date).toLocaleDateString('he-IL')
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "תנועות");
    XLSX.writeFile(workbook, `דוח_משפחת_טולדנו_${new Date().toLocaleDateString('he-IL')}.xlsx`);
};

function updateChart(totals) {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    if (myChart) myChart.destroy();
    if (Object.keys(totals).length === 0) { document.getElementById('chart-empty-msg').style.display = 'block'; return; }
    document.getElementById('chart-empty-msg').style.display = 'none';
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{ data: Object.values(totals), backgroundColor: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#F2E2B2', '#D9B2F2'] }]
        }
    });
}
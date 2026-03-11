import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let allData = [];
let myChart = null;
let currentType = 'expense';
let editId = null;
let chartType = 'doughnut';

const chartColors = ['#002d4b', '#00c2cb', '#7d77b1', '#c5a059', '#a5b4fc', '#4ade80', '#fb923c', '#f87171', '#14b8a6', '#8b5cf6', '#eab308'];

window.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        if (id === 'modal-form') {
            document.getElementById('transaction-form').reset();
            editId = null;
            currentType = 'expense';
            updateTypeButtons();
        }
    }
};

window.openVisionHub = () => openModal('modal-vision-hub');

window.showSpecificChart = (type) => {
    closeModal('modal-vision-hub');
    chartType = type;
    updateChartText(type);
    openModal('modal-single-chart');

    setTimeout(() => {
        if (allData.length > 0) {
            renderUI(allData);
        }
    }, 300);
};

window.backToHub = () => {
    closeModal('modal-single-chart');
    openModal('modal-vision-hub');
};

function init() {
    populateMonths();
    setupTypeSelector();
    setupCategories();

    onSnapshot(query(transactionsCol, orderBy("date", "desc")), (snapshot) => {
        allData = [];
        snapshot.forEach(docSnap => {
            allData.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderUI(allData);
    });
}

function populateMonths() {
    const filter = document.getElementById('month-filter');
    if (!filter || filter.options.length > 0) return;

    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    const currentMonth = new Date().getMonth();

    let optAll = document.createElement('option');
    optAll.value = "all";
    optAll.innerText = "הכל מהתחלה";
    filter.appendChild(optAll);

    months.forEach((m, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerText = m;
        if (i === currentMonth) opt.selected = true;
        filter.appendChild(opt);
    });

    filter.onchange = () => renderUI(allData);
}

function renderUI(data) {
    const filterEl = document.getElementById('month-filter');
    const selMonth = filterEl ? filterEl.value : "all";
    const tbody = document.getElementById('transactions-body');

    if (tbody) tbody.innerHTML = '';

    let inc = 0;
    let exp = 0;
    const catTotals = {};
    const detailedList = {};

    const filtered = data.filter(t => {
        const d = new Date(t.date);
        return (selMonth === "all") || (d.getMonth() == selMonth);
    });

    filtered.forEach(t => {
        if (t.type === 'income') {
            inc += t.amount;
        } else {
            exp += t.amount;
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
            if (!detailedList[t.category]) detailedList[t.category] = [];
            detailedList[t.category].push(`${t.description}: ₪${t.amount.toLocaleString()}`);
        }

        if (tbody) {
            const dateStr = new Date(t.date).toLocaleDateString('he-IL');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.description} ${t.recurring ? '🔄' : ''}</td>
                <td>${t.category}</td>
                <td style="color: ${t.type === 'income' ? 'var(--more-teal)' : '#ff5a5f'}">
                    ${t.type === 'income' ? '↑' : '↓'}
                </td>
                <td style="font-weight:bold">₪${t.amount.toLocaleString()}</td>
                <td>${dateStr}</td>
                <td>
                    <button onclick="editTransaction('${t.id}')" style="background:none; border:none; cursor:pointer;">📝</button>
                    <button onclick="deleteTransaction('${t.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });

    const incEl = document.getElementById('total-income');
    const expEl = document.getElementById('total-expenses');
    const balEl = document.getElementById('balance');

    if (incEl) incEl.innerText = `₪${inc.toLocaleString()}`;
    if (expEl) expEl.innerText = `₪${exp.toLocaleString()}`;

    if (balEl) {
        const balance = inc - exp;
        balEl.innerText = `₪${balance.toLocaleString()}`;
        balEl.style.color = balance >= 0 ? 'var(--more-navy)' : '#ff5a5f';
    }

    renderChart(filtered, catTotals, detailedList);
}

function updateChartText(type) {
    const titleEl = document.getElementById('chart-main-title');
    const descEl = document.getElementById('chart-main-description');

    if (!titleEl || !descEl) return;

    if (type === 'doughnut') {
        titleEl.innerText = 'התפלגות הוצאות לפי קטגוריות';
        descEl.innerText = 'הגרף הזה עוזר לך להבין לאן הכסף שלך הולך בפועל. במקום בלאגן של תנועות, Finly מרכז לך תמונה ברורה של חלוקת ההוצאות כדי שתוכל לזהות במהירות את הקטגוריות הכבדות ביותר.';
    }

    if (type === 'bar') {
        titleEl.innerText = 'השוואת הכנסות והוצאות';
        descEl.innerText = 'הגרף הזה נותן מבט ברור על היחסים בין הכנסות להוצאות לאורך זמן. Finly עוזר לך לזהות פערים, להבין אם אתה שומר על איזון, ולקבל החלטות טובות יותר מתוך מספרים פשוטים וברורים.';
    }

    if (type === 'line') {
        titleEl.innerText = 'מגמות ושינויים לאורך זמן';
        descEl.innerText = 'הגרף הזה נועד לחשוף תנועה, לא רק מספרים. Finly עוזר לך לזהות מגמות של עלייה או ירידה, להבין מתי נוצר עומס פיננסי, ולהפוך מידע מפוזר לתובנות שמייצרות סדר.';
    }
}

function getMonthlyComparisonData(data) {
    const months = ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"];
    const incomeByMonth = new Array(12).fill(0);
    const expenseByMonth = new Array(12).fill(0);

    data.forEach(t => {
        const monthIndex = new Date(t.date).getMonth();
        if (t.type === 'income') {
            incomeByMonth[monthIndex] += t.amount;
        } else {
            expenseByMonth[monthIndex] += t.amount;
        }
    });

    return {
        labels: months,
        incomeData: incomeByMonth,
        expenseData: expenseByMonth
    };
}

function getExpenseTrendData(data) {
    const months = ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"];
    const expenseByMonth = new Array(12).fill(0);

    data.forEach(t => {
        if (t.type === 'expense') {
            const monthIndex = new Date(t.date).getMonth();
            expenseByMonth[monthIndex] += t.amount;
        }
    });

    return {
        labels: months,
        expenseData: expenseByMonth
    };
}

function renderChart(filteredData, totals, details) {
    const canvas = document.getElementById('main-chart') || document.querySelector('#modal-single-chart canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (myChart) myChart.destroy();

    if (chartType === 'doughnut') {
        if (Object.keys(totals).length === 0) return;

        const labels = Object.keys(totals);
        const dataValues = Object.values(totals);
        const backgroundColors = labels.map((_, index) => chartColors[index % chartColors.length]);

        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'התפלגות הוצאות',
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: { family: 'Rubik' },
                            padding: 18,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ₪${ctx.raw.toLocaleString()}`,
                            afterBody: (ctx) => {
                                const cat = ctx[0].label;
                                return details[cat] ? ["", "פירוט:", ...details[cat]] : [];
                            }
                        }
                    }
                }
            }
        });

        return;
    }

    if (chartType === 'bar') {
        const monthlyData = getMonthlyComparisonData(filteredData);

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'הכנסות',
                        data: monthlyData.incomeData,
                        backgroundColor: '#00c2cb',
                        borderColor: '#00c2cb',
                        borderWidth: 1,
                        borderRadius: 8
                    },
                    {
                        label: 'הוצאות',
                        data: monthlyData.expenseData,
                        backgroundColor: '#7d77b1',
                        borderColor: '#7d77b1',
                        borderWidth: 1,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: { family: 'Rubik' },
                            padding: 18,
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ₪${ctx.raw.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'right'
                    },
                    x: {
                        reverse: false
                    }
                }
            }
        });

        return;
    }

    if (chartType === 'line') {
        const trendData = getExpenseTrendData(filteredData);

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'מגמת הוצאות',
                    data: trendData.expenseData,
                    borderColor: '#00c2cb',
                    backgroundColor: 'rgba(0, 194, 203, 0.18)',
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#00c2cb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: { family: 'Rubik' },
                            padding: 18,
                            usePointStyle: true,
                            pointStyle: 'line'
                        }
                    },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ₪${ctx.raw.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'right'
                    },
                    x: {
                        reverse: false
                    }
                }
            }
        });
    }
}

const form = document.getElementById('transaction-form');
if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();

        const existingTransaction = editId ? allData.find(t => t.id === editId) : null;

        const transactionData = {
            description: document.getElementById('transaction-name').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            type: currentType,
            recurring: false,
            date: existingTransaction ? existingTransaction.date : Date.now()
        };

        try {
            if (editId) {
                await updateDoc(doc(db, "transactions", editId), transactionData);
            } else {
                await addDoc(transactionsCol, transactionData);
            }
            closeModal('modal-form');
        } catch (e) {
            console.error(e);
        }
    };
}

window.deleteTransaction = async (id) => {
    if (confirm("למחוק?")) await deleteDoc(doc(db, "transactions", id));
};

window.editTransaction = (id) => {
    const t = allData.find(item => item.id === id);
    if (!t) return;

    closeModal('modal-table');
    openModal('modal-form');

    document.getElementById('transaction-name').value = t.description;
    document.getElementById('transaction-amount').value = t.amount;
    document.getElementById('transaction-category').value = t.category;

    currentType = t.type;
    editId = id;
    updateTypeButtons();
};

function setupTypeSelector() {
    const expBtn = document.getElementById('type-btn-expense');
    const incBtn = document.getElementById('type-btn-income');

    if (expBtn && incBtn) {
        expBtn.onclick = () => {
            currentType = 'expense';
            updateTypeButtons();
        };

        incBtn.onclick = () => {
            currentType = 'income';
            updateTypeButtons();
        };
    }
}

function updateTypeButtons() {
    const expBtn = document.getElementById('type-btn-expense');
    const incBtn = document.getElementById('type-btn-income');

    if (!expBtn || !incBtn) return;

    if (currentType === 'expense') {
        expBtn.classList.add('active');
        incBtn.classList.remove('active');
    } else {
        incBtn.classList.add('active');
        expBtn.classList.remove('active');
    }
}

function setupCategories() {
    const cats = ["מזון", "בית", "חינוך", "פנאי", "רכב", "בריאות", "אשראי", "משכורת", "אחר"];
    const catSelect = document.getElementById('transaction-category');

    if (catSelect) {
        catSelect.innerHTML = '';
        cats.forEach(c => {
            let o = document.createElement('option');
            o.value = c;
            o.innerText = c;
            catSelect.appendChild(o);
        });
    }
}

init();

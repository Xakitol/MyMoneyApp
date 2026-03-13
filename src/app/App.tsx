import { useState } from 'react';
import { GlassCard } from './components/cards/GlassCard';
import { CircularButton } from './components/buttons/CircularButton';
import { InsightsModal } from './components/modals/InsightsModal';
import { ChartModal } from './components/modals/ChartModal';
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { TransactionTableModal } from './components/modals/TransactionTableModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { StarField } from './components/effects/StarField';
import {
  ChevronDown,
  Sparkles,
  BarChart3,
  List,
  Plus,
  Moon,
  Sun,
  Edit,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
} from 'lucide-react';

export default function App() {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [savingsGoalOpen, setSavingsGoalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState(12000);

  const monthlyIncome = 17704;
  const monthlyExpenses = 6135.9;
  const netBalance = 11568.1;
  const upcomingAmount = 2350;
  const safeToSpend = netBalance - upcomingAmount;
  const savingsProgress = Math.min((netBalance / savingsGoal) * 100, 100);

  const backgroundGradient = darkMode
    ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #2a1f4a 100%)'
    : 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 50%, #fae8ff 100%)';

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden relative animate-in fade-in duration-700"
      style={{
        fontFamily: 'Rubik, sans-serif',
        background: backgroundGradient,
      }}
    >
      <StarField darkMode={darkMode} />

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pb-8 pt-4 sm:px-5">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircularButton
              size="sm"
              variant="glass"
              onClick={() => setDarkMode(!darkMode)}
              className="shrink-0"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-yellow-300" />
              ) : (
                <Moon className="h-4 w-4 text-violet-600" />
              )}
            </CircularButton>

            <GlassCard hover={false} className="px-4 py-2">
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={`h-4 w-4 ${darkMode ? 'text-cyan-300' : 'text-violet-600'}`}
                />
                <select
                  className={`bg-transparent text-sm font-medium outline-none ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  <option value="march" className="bg-slate-800">
                    מרץ
                  </option>
                  <option value="feb" className="bg-slate-800">
                    פברואר
                  </option>
                  <option value="jan" className="bg-slate-800">
                    ינואר
                  </option>
                </select>
              </div>
            </GlassCard>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p
                className={`text-xs ${darkMode ? 'text-cyan-200/70' : 'text-cyan-700/70'}`}
              >
                המסך הראשי
              </p>
              <h1
                className={`text-2xl font-bold ${
                  darkMode
                    ? 'bg-gradient-to-r from-cyan-300 via-violet-300 to-purple-300 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent'
                }`}
              >
                Finly
              </h1>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
        </header>

        <main className="space-y-4">
          <GlassCard className="p-5">
            <div className="text-right">
              <p className={`mb-2 text-sm ${darkMode ? 'text-cyan-200/70' : 'text-cyan-700/80'}`}>
                נשאר לך עד סוף החודש
              </p>

              <h2 className={`text-4xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ₪{safeToSpend.toLocaleString()}
              </h2>

              <p className={`mt-2 text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                אחרי הוצאות צפויות של ₪{upcomingAmount.toLocaleString()}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-4 text-white shadow-lg transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">הוסף תנועה</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTableOpen(true)}
                className={`rounded-2xl border px-4 py-4 transition-all active:scale-[0.98] ${
                  darkMode
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/40 bg-white/30 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <List className="h-5 w-5" />
                  <span className="font-medium">כל התנועות</span>
                </div>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="mb-3 text-right">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                תמונת מצב
              </h3>
              <p className={`text-sm ${darkMode ? 'text-cyan-200/60' : 'text-cyan-700/70'}`}>
                מה נכנס, מה יצא, ומה באמת נשאר
              </p>
            </div>

            <div className="space-y-3">
              <div
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  darkMode ? 'bg-white/5' : 'bg-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20">
                    <ArrowDownLeft className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>הכנסות</p>
                    <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>החודש</p>
                  </div>
                </div>
                <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  ₪{monthlyIncome.toLocaleString()}
                </p>
              </div>

              <div
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  darkMode ? 'bg-white/5' : 'bg-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
                    <ArrowUpRight className="h-5 w-5 text-violet-300" />
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>הוצאות</p>
                    <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>שכבר נרשמו</p>
                  </div>
                </div>
                <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  ₪{monthlyExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <CircularButton
                  size="sm"
                  variant="glass"
                  onClick={() => setSavingsGoalOpen(true)}
                  className="shrink-0"
                >
                  <Edit className="h-4 w-4 text-violet-300" />
                </CircularButton>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                  <PiggyBank className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="flex-1 text-right">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  יעד חיסכון
                </h3>
                <p className={`text-sm ${darkMode ? 'text-cyan-200/60' : 'text-cyan-700/70'}`}>
                  יעד: ₪{savingsGoal.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                <p>{Math.round(savingsProgress)}%</p>
                <p>כרגע נחסכו ₪{netBalance.toLocaleString()}</p>
              </div>

              <div className="relative h-3 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
                <div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #0f1729 0%, #6366f1 25%, #8b5cf6 50%, #00d4d4 75%, #00e5ff 100%)',
                    width: `${savingsProgress}%`,
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
                  }}
                />
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-3">
            <GlassCard
              className="p-4 text-center"
              onClick={() => setInsightsOpen(true)}
            >
              <div className="mb-3 flex justify-center">
                <CircularButton size="sm" variant="glass">
                  <BarChart3 className={`h-5 w-5 ${darkMode ? 'text-cyan-300' : 'text-cyan-600'}`} />
                </CircularButton>
              </div>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                תובנות
              </h3>
              <p className={`mt-1 text-xs ${darkMode ? 'text-cyan-200/60' : 'text-cyan-700/70'}`}>
                מגמות ומבט מהיר
              </p>
            </GlassCard>

            <GlassCard
              className="p-4 text-center"
              onClick={() => setTableOpen(true)}
            >
              <div className="mb-3 flex justify-center">
                <CircularButton size="sm" variant="glass">
                  <List className={`h-5 w-5 ${darkMode ? 'text-violet-300' : 'text-violet-600'}`} />
                </CircularButton>
              </div>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                תנועות
              </h3>
              <p className={`mt-1 text-xs ${darkMode ? 'text-violet-200/60' : 'text-violet-700/70'}`}>
                היסטוריה וחיפוש
              </p>
            </GlassCard>
          </div>
        </main>
      </div>

      <InsightsModal
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        onOpenChart={() => setChartOpen(true)}
        darkMode={darkMode}
      />
      <ChartModal open={chartOpen} onClose={() => setChartOpen(false)} darkMode={darkMode} />
      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} darkMode={darkMode} />
      <TransactionTableModal open={tableOpen} onClose={() => setTableOpen(false)} darkMode={darkMode} />
      <SavingsGoalModal
        open={savingsGoalOpen}
        onClose={() => setSavingsGoalOpen(false)}
        currentGoal={savingsGoal}
        onSave={setSavingsGoal}
      />
    </div>
  );
}

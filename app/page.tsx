"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, BarChart3, Settings, LogOut, Plus, Trash2, 
  CheckCircle2, Zap, Target, Sun, Moon, Award, Calendar, 
  Sparkles, AlertTriangle, ArrowRight, Lock, Eye, EyeOff
} from 'lucide-react';

// --- INJEKSI ANIMASI KUSTOM ---
const CustomAnimationStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes float-subtle {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes popIn {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes checkPop {
      0% { transform: scale(0.8); }
      50% { transform: scale(1.25); }
      100% { transform: scale(1); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    .animate-float {
      animation: float 4s ease-in-out infinite;
    }
    .animate-float-subtle {
      animation: float-subtle 3s ease-in-out infinite;
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-pop-in {
      animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .animate-check-pop {
      animation: checkPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    .animate-pulse-glow {
      animation: pulse-glow 3s infinite;
    }
  `}} />
);

// --- HELPER FUNCTIONS ---
const getFormattedDate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

const getToday = () => getFormattedDate(new Date());

const getLastNDays = (n) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(getFormattedDate(d));
  }
  return dates;
};

const calculateStreak = (daysArray) => {
  if (!daysArray || daysArray.length === 0) return 0;
  let streak = 0;
  let checkDate = new Date();
  const todayStr = getToday();
  const hasToday = daysArray.includes(todayStr);

  if (!hasToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = getFormattedDate(checkDate);
    if (daysArray.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login' | 'dashboard' | 'statistik' | 'pencapaian' | 'pengaturan'
  const [habits, setHabits] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userName, setUserName] = useState('Alex');

  // Input States
  const [newHabitName, setNewHabitName] = useState('');
  const [habitTarget, setHabitTarget] = useState(21);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Load data dari LocalStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('habitflow_habits');
    const savedTheme = localStorage.getItem('habitflow_theme');
    const savedUser = localStorage.getItem('habitflow_user');
    const savedTimeRange = localStorage.getItem('habitflow_timerange');
    const savedAuth = localStorage.getItem('habitflow_auth');

    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedTheme === 'light') setIsDarkMode(false);
    if (savedUser) setUserName(savedUser);
    if (savedTimeRange) setTimeRange(Number(savedTimeRange));
    if (savedAuth === 'true') setCurrentView('dashboard');
    
    setIsLoaded(true);
  }, []);

  // Sinkronisasi data ke LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('habitflow_habits', JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('habitflow_theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('habitflow_timerange', timeRange.toString());
    }
  }, [timeRange, isLoaded]);

  if (!isLoaded) return null;

  // Handler Aksi Habit
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabitObj = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      target: Number(habitTarget),
      days: [], 
      createdAt: getToday()
    };

    setHabits([...habits, newHabitObj]);
    setNewHabitName('');
  };

  const handleDeleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
    setDeleteConfirmId(null);
  };

  const toggleHabitDay = (habitId, dateStr) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.days.includes(dateStr);
        const newDays = isCompleted
          ? habit.days.filter(d => d !== dateStr)
          : [...habit.days, dateStr];
        return { ...habit, days: newDays };
      }
      return habit;
    }));
  };

  const handleResetAll = () => {
    setHabits([]);
    setResetConfirm(false);
  };

  // Kalkulasi data statistik harian
  const todayStr = getToday();
  const completedTodayCount = habits.filter(h => h.days.includes(todayStr)).length;
  const totalHabits = habits.length;
  const todayProgressPercent = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  // Kalkulasi tingkat kesuksesan konsistensi berdasarkan rentang waktu pilihan
  const calculateProgressRange = () => {
    if (habits.length === 0) return 0;
    const lastNDays = getLastNDays(timeRange);
    const totalPossiblePoints = habits.length * timeRange;
    let totalCompletedPoints = 0;

    habits.forEach(h => {
      lastNDays.forEach(day => {
        if (h.days.includes(day)) totalCompletedPoints++;
      });
    });

    return Math.round((totalCompletedPoints / totalPossiblePoints) * 100);
  };

  const currentStreakTop = habits.length > 0 ? Math.max(...habits.map(h => calculateStreak(h.days)), 0) : 0;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <CustomAnimationStyles />
      
      {/* TAMPILAN 1: LANDING PAGE */}
      {currentView === 'landing' && (
        <div className="min-h-screen relative overflow-hidden animate-fade-in">
          {/* Radial Purple Glow Background */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/15 dark:bg-purple-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse-glow"></div>

          {/* Navigation */}
          <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">HabitFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={() => setCurrentView('login')}
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
              >
                Mulai Gratis
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <header className="container mx-auto px-6 pt-16 pb-24 text-center max-w-4xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-6 animate-float-subtle">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Gaya Hidup Lebih Teratur & Produktif</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
              Transform Your Daily Routine into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-purple-600">Achievable Milestones</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              Dashboard intuitif yang membantumu memantau kemajuan serta konsistensi kebiasaan sehari-hari dengan visual menarik, modern, dan bebas distraksi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setCurrentView('login')}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(147,51,234,0.5)] flex items-center justify-center gap-2 group"
              >
                Coba Dashboard Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Mockup Dashboard Preview - Floating animation */}
            <div className={`mt-16 rounded-3xl p-4 border transition-all duration-500 animate-float ${isDarkMode ? 'bg-slate-900/60 border-slate-800 shadow-purple-950/20 shadow-2xl' : 'bg-white border-slate-200 shadow-2xl'}`}>
              <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 hover:scale-125 transition-transform" />
                  <div className="w-3 h-3 rounded-full bg-amber-500 hover:scale-125 transition-transform" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 hover:scale-125 transition-transform" />
                </div>
                <div className="text-xs text-slate-400 font-mono">live_preview.json</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className={`p-4 rounded-2xl border hover:scale-[1.03] transition-all duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-400">Total Progres</p>
                  <p className="text-2xl font-bold text-purple-500">85%</p>
                </div>
                <div className={`p-4 rounded-2xl border hover:scale-[1.03] transition-all duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-400">Target Hari</p>
                  <p className="text-2xl font-bold">21 Hari</p>
                </div>
                <div className={`p-4 rounded-2xl border hover:scale-[1.03] transition-all duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-400">Pencapaian</p>
                  <p className="text-2xl font-bold text-amber-500">🔥 7 Hari Aktif</p>
                </div>
              </div>
            </div>
          </header>
        </div>
      )}

      {/* TAMPILAN 2: HALAMAN LOGIN */}
      {currentView === 'login' && (
        <div className="animate-fade-in">
          <LoginScreen 
            isDarkMode={isDarkMode} 
            toggleTheme={() => setIsDarkMode(!isDarkMode)} 
            onSuccess={() => {
              localStorage.setItem('habitflow_auth', 'true');
              setCurrentView('dashboard');
            }}
          />
        </div>
      )}

      {/* TAMPILAN 3: INTEGRATED DASHBOARD WORKSPACE (TAB LAYOUT) */}
      {['dashboard', 'statistik', 'pencapaian', 'pengaturan'].includes(currentView) && (
        <div className="min-h-screen flex animate-fade-in">
          
          {/* SIDEBAR UTAMA */}
          <aside className={`w-20 md:w-64 border-r flex flex-col justify-between py-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="px-4">
              <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer" onClick={() => setCurrentView('landing')}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md group-hover:rotate-12 transition-transform duration-300">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl hidden md:block tracking-tight">HabitFlow</span>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                <SidebarItem icon={<CheckCircle2 />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
                <SidebarItem icon={<BarChart3 />} label="Statistik" active={currentView === 'statistik'} onClick={() => setCurrentView('statistik')} />
                <SidebarItem icon={<Award />} label="Pencapaian" active={currentView === 'pencapaian'} onClick={() => setCurrentView('pencapaian')} />
                <SidebarItem icon={<Settings />} label="Pengaturan" active={currentView === 'pengaturan'} onClick={() => setCurrentView('pengaturan')} />
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="px-4 space-y-2 border-t pt-4 border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className={`w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-purple-500 hover:scale-105 active:scale-95 transition-all`}
              >
                {isDarkMode ? <Sun size={20} className="text-amber-500 animate-spin-slow" /> : <Moon size={20} className="text-purple-600" />}
                <span className="hidden md:block text-sm font-medium">Tema {isDarkMode ? 'Terang' : 'Gelap'}</span>
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('habitflow_auth');
                  setCurrentView('landing');
                }} 
                className="w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl hover:bg-rose-500/10 text-rose-500 hover:scale-105 active:scale-95 transition-all"
              >
                <LogOut size={20} />
                <span className="hidden md:block text-sm font-medium">Keluar</span>
              </button>
            </div>
          </aside>

          {/* MAIN CONTAINER WORKSPACE */}
          <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10">
            
            {/* TAB: DASHBOARD */}
            {currentView === 'dashboard' && (
              <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                {/* Header Welcome */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Halo, {userName}! 👋</h2>
                    <p className="text-slate-500 text-sm mt-1">Kamu sudah menyelesaikan {completedTodayCount} dari {totalHabits} kebiasaan hari ini.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-400">Rapor Rentang:</span>
                    <select 
                      value={timeRange} 
                      onChange={(e) => setTimeRange(Number(e.target.value))}
                      className={`text-sm py-1.5 px-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:border-purple-500 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    >
                      <option value={7}>7 Hari Terakhir</option>
                      <option value={14}>14 Hari Terakhir</option>
                      <option value={30}>30 Hari Terakhir</option>
                      <option value={66}>66 Hari Terakhir (Saran Psikolog)</option>
                      <option value={90}>90 Hari Terakhir</option>
                    </select>
                  </div>
                </div>

                {/* Grid Rapor Utama - Animated Pop In */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="animate-pop-in" style={{ animationDelay: '0.05s' }}>
                    <StatCard 
                      title="Konsistensi Rapor" 
                      value={`${calculateProgressRange()}%`} 
                      subtitle={`${timeRange} hari terakhir`}
                      icon={<Activity className="text-purple-500" />}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className="animate-pop-in" style={{ animationDelay: '0.1s' }}>
                    <StatCard 
                      title="Streak Terlama" 
                      value={`${currentStreakTop} Hari`} 
                      subtitle="Menakjubkan! 🔥"
                      icon={<Zap className="text-amber-500 animate-pulse" />}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className="animate-pop-in" style={{ animationDelay: '0.15s' }}>
                    <StatCard 
                      title="Progres Hari Ini" 
                      value={`${todayProgressPercent}%`} 
                      subtitle={`${completedTodayCount}/${totalHabits} selesai`}
                      icon={<Target className="text-indigo-500" />}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Input & Lists */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* INPUT HABIT KUSTOM */}
                    <div className={`p-6 rounded-2xl border hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Plus className="text-purple-500 w-5 h-5 animate-pulse" /> Buat Kebiasaan Baru
                      </h3>
                      <form onSubmit={handleAddHabit} className="space-y-4">
                        <input 
                          type="text"
                          value={newHabitName}
                          onChange={(e) => setNewHabitName(e.target.value)}
                          placeholder="Masukkan nama kebiasaan (misal: Olahraga pagi)"
                          className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400'}`}
                        />
                        
                        {/* Target Duration Selector */}
                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Target Durasi Kebiasaan:</label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {[21, 30, 66, 90].map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => setHabitTarget(days)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                                  habitTarget === days 
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                                    : (isDarkMode ? 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700')
                                }`}
                              >
                                {days} Hari
                              </button>
                            ))}
                            {/* Input Target Manual */}
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                min="1"
                                value={habitTarget}
                                onChange={(e) => setHabitTarget(Math.max(1, Number(e.target.value)))}
                                className={`w-20 p-1.5 rounded-lg border text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:border-purple-500 transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
                              />
                              <span className="text-xs text-slate-400">Hari</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={!newHabitName.trim()}
                          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                        >
                          <Plus size={18} /> Tambah Kebiasaan
                        </button>
                      </form>
                    </div>

                    {/* DAFTAR MISI HARI INI */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Misi Hari Ini</h3>
                      
                      {habits.length === 0 ? (
                        <div className={`text-center py-12 px-6 border-2 border-dashed rounded-2xl animate-fade-in ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-float-subtle" />
                          <p className="font-semibold text-slate-500">Belum ada kebiasaan</p>
                          <p className="text-xs text-slate-400 mt-1">Tambahkan beberapa kebiasaan baru di atas untuk memulai hari produktifmu!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {habits.map((habit, index) => {
                            const isDoneToday = habit.days.includes(todayStr);
                            const streakVal = calculateStreak(habit.days);
                            
                            return (
                              <div 
                                key={habit.id} 
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:translate-x-1 ${
                                  isDoneToday 
                                    ? (isDarkMode ? 'bg-purple-950/20 border-purple-900/50' : 'bg-purple-50 border-purple-200')
                                    : (isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                                }`}
                                style={{ animationPlayState: 'running' }}
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  {/* Custom Checkbox dengan animasi Pop/Bounce */}
                                  <button
                                    onClick={() => toggleHabitDay(habit.id, todayStr)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0 active:scale-75 ${
                                      isDoneToday 
                                        ? 'bg-purple-600 border-purple-600 text-white animate-check-pop shadow-md shadow-purple-600/30' 
                                        : 'border-slate-300 dark:border-slate-700 hover:border-purple-500'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-5 h-5" />
                                  </button>
                                  <div>
                                    <span className={`font-semibold transition-all duration-300 ${isDoneToday ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                      {habit.name}
                                    </span>
                                    <div className="flex gap-2 items-center text-xs text-slate-400 mt-1">
                                      <span className="flex items-center gap-1 text-amber-500 font-semibold animate-pulse">
                                        <Zap className="w-3.5 h-3.5 fill-amber-500" /> {streakVal} hari streak
                                      </span>
                                      <span>•</span>
                                      <span>Target: {habit.target} Hari</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Inline Confirmation Delete */}
                                {deleteConfirmId === habit.id ? (
                                  <div className="flex items-center gap-2 animate-pop-in">
                                    <button 
                                      onClick={() => handleDeleteHabit(habit.id)}
                                      className="px-2.5 py-1 rounded bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
                                    >
                                      Hapus
                                    </button>
                                    <button 
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setDeleteConfirmId(habit.id)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Info Box */}
                  <div className="space-y-6">
                    <div className={`p-6 rounded-2xl border hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <h4 className="font-bold flex items-center gap-2 mb-3 text-purple-500">
                        <Sparkles size={18} className="animate-float-subtle" /> Tip Pembentukan Habit
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Berdasarkan studi penelitian psikologi, rata-rata orang membutuhkan waktu sekitar <strong>66 Hari</strong> agar suatu kebiasaan baru dapat terbentuk secara otomatis dalam sistem kognitif bawah sadar mereka. Tetapkan target yang realistis sesuai kapasitas energimu.
                      </p>
                    </div>

                    <div className={`p-6 rounded-2xl border hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <h4 className="font-bold mb-4">Ringkasan Aktivitas</h4>
                      <div className="space-y-3 text-xs font-medium">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Habit Terdaftar:</span>
                          <span className="font-bold">{totalHabits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Selesai Hari Ini:</span>
                          <span className="font-bold text-emerald-500">{completedTodayCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tingkat Penyelesaian:</span>
                          <span className="font-bold text-purple-500">{todayProgressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: STATISTIK */}
            {currentView === 'statistik' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <h2 className="text-3xl font-extrabold tracking-tight">Statistik & Riwayat</h2>
                <p className="text-slate-400 -mt-6 text-sm">Analisis konsistensi dan riwayat centang kebiasaanmu.</p>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Calendar className="text-purple-500" /> Matriks Konsistensi {timeRange} Hari Terakhir
                  </h3>
                  
                  {habits.length === 0 ? (
                    <p className="text-center py-8 text-slate-500 animate-fade-in">Belum ada data statistik terkumpul.</p>
                  ) : (
                    <div className="space-y-6">
                      {habits.map((habit, hIdx) => {
                        const lastDaysList = getLastNDays(Math.min(15, timeRange));
                        return (
                          <div key={habit.id} className="space-y-2 animate-fade-in" style={{ animationDelay: `${hIdx * 0.05}s` }}>
                            <div className="flex justify-between text-sm font-semibold">
                              <span>{habit.name}</span>
                              <span className="text-purple-500">Target {habit.target} Hari</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {lastDaysList.map(dayStr => {
                                const isDone = habit.days.includes(dayStr);
                                return (
                                  <div 
                                    key={dayStr}
                                    title={dayStr} 
                                    className={`w-10 h-10 rounded-lg shrink-0 flex flex-col items-center justify-center text-[10px] font-bold border transition-all duration-300 hover:scale-110 cursor-pointer ${
                                      isDone 
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-sm' 
                                        : (isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300')
                                    }`}
                                  >
                                    <span>{dayStr.slice(-2)}</span>
                                    <span>{isDone ? '✓' : '•'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PENCAPAIAN */}
            {currentView === 'pencapaian' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <h2 className="text-3xl font-extrabold tracking-tight">Badge Pencapaian</h2>
                <p className="text-slate-400 -mt-6 text-sm">Buka lencana penghargaan seiring peningkatan performa produktivitasmu!</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="animate-pop-in" style={{ animationDelay: '0.05s' }}>
                    <BadgeCard 
                      title="Langkah Pertama" 
                      desc="Buat minimal 1 kebiasaan awal." 
                      unlocked={totalHabits >= 1} 
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className="animate-pop-in" style={{ animationDelay: '0.1s' }}>
                    <BadgeCard 
                      title="Konsisten 3 Hari" 
                      desc="Mencapai streak minimal 3 hari di salah satu kebiasaan." 
                      unlocked={currentStreakTop >= 3} 
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className="animate-pop-in" style={{ animationDelay: '0.15s' }}>
                    <BadgeCard 
                      title="Habit Master (7 Hari)" 
                      desc="Mempertahankan streak minimal 7 hari tanpa terputus." 
                      unlocked={currentStreakTop >= 7} 
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PENGATURAN */}
            {currentView === 'pengaturan' && (
              <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                <h2 className="text-3xl font-extrabold tracking-tight">Pengaturan Aplikasi</h2>
                <p className="text-slate-400 -mt-6 text-sm">Sesuaikan profil pengguna dan konfigurasi global lainnya.</p>

                {/* Edit Profil */}
                <div className={`p-6 rounded-2xl border hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-lg mb-4">Profil Saya</h3>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Nama Pengguna:</label>
                    <input 
                      type="text" 
                      value={userName} 
                      onChange={(e) => {
                        setUserName(e.target.value);
                        localStorage.setItem('habitflow_user', e.target.value);
                      }}
                      className={`w-full max-w-md p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-400'}`}
                    />
                  </div>
                </div>

                {/* Zona Bahaya */}
                <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-red-900/30' : 'bg-red-50/30 border-red-200'}`}>
                  <h3 className="font-bold text-lg text-rose-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="animate-bounce" /> Zona Bahaya
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">Menghapus seluruh kebiasaan serta riwayat pelacakan yang ada secara permanen.</p>

                  {resetConfirm ? (
                    <div className="space-y-4 animate-pop-in">
                      <p className="text-rose-500 text-xs font-bold animate-pulse">Apakah kamu benar-benar yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={handleResetAll} 
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
                        >
                          Ya, Hapus Semua
                        </button>
                        <button 
                          onClick={() => setResetConfirm(false)} 
                          className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setResetConfirm(true)} 
                      className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                    >
                      Reset Seluruh Data
                    </button>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      )}

    </div>
  );
}

// --- SUB KOMPONEN INTERAKTIF ---

// Sidebar Item
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl transition-all border hover:scale-[1.02] active:scale-[0.98] ${
      active 
        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25' 
        : 'text-slate-400 hover:text-purple-500 hover:bg-purple-500/10 border-transparent'
    }`}
  >
    {React.cloneElement(icon, { className: `w-5 h-5 shrink-0 ${active ? 'animate-pulse' : ''}` })}
    <span className="hidden md:block text-sm font-medium">{label}</span>
  </button>
);

// Stat Card
const StatCard = ({ title, value, subtitle, icon, isDarkMode }) => (
  <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
    isDarkMode 
      ? 'bg-slate-900 border-slate-800 hover:border-purple-900/50 hover:shadow-purple-950/10' 
      : 'bg-white border-slate-200 shadow-sm hover:border-purple-200 hover:shadow-purple-100/50'
  }`}>
    <div className="flex justify-between items-start mb-4">
      <span className="text-sm font-medium text-slate-400">{title}</span>
      <div className={`p-2 rounded-lg transition-transform hover:rotate-12 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
        {icon}
      </div>
    </div>
    <p className="text-3xl font-extrabold tracking-tight">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
  </div>
);

// Badge Card (Pencapaian)
const BadgeCard = ({ title, desc, unlocked, isDarkMode }) => (
  <div className={`p-6 rounded-2xl border text-center relative overflow-hidden transition-all duration-300 hover:scale-[1.03] ${
    unlocked 
      ? 'border-purple-500/40 bg-gradient-to-b from-purple-500/5 to-purple-500/10 hover:shadow-purple-500/5 hover:shadow-lg' 
      : (isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-slate-100/50 border-slate-200 text-slate-400')
  }`}>
    <div className="flex justify-center mb-4">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
        unlocked 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
          : (isDarkMode ? 'bg-slate-950 text-slate-600' : 'bg-slate-200 text-slate-400')
      }`}>
        <Award size={28} className={unlocked ? 'animate-float-subtle' : ''} />
      </div>
    </div>
    <h3 className={`font-bold text-base transition-colors duration-300 ${unlocked ? (isDarkMode ? 'text-slate-100' : 'text-slate-900') : 'text-slate-500'}`}>{title}</h3>
    <p className="text-xs text-slate-400 mt-2">{desc}</p>
    <div className="mt-4">
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all ${
        unlocked ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-200 dark:bg-slate-950 text-slate-500'
      }`}>
        {unlocked ? 'Terbuka' : 'Terkunci'}
      </span>
    </div>
  </div>
);

// LOGIN SCREEN COMPONENT
const LoginScreen = ({ isDarkMode, toggleTheme, onSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (accessCode === 'SUKSES2026') {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
      {/* Glow effect on login */}
      <div className="absolute w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse-glow"></div>
      
      <div className={`w-full max-w-sm rounded-3xl p-8 border hover:shadow-2xl transition-all duration-300 animate-pop-in ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl relative z-10`}>
        
        {/* Logo / Icon */}
        <div className="w-16 h-16 bg-purple-600/10 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-inner animate-float-subtle">
          <Lock size={28} />
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-2">Buka Potensi Dirimu</h1>
        <p className="text-xs text-slate-400 text-center mb-8">Masukkan kode akses rahasia untuk langsung me-load dashboard kebiasaanmu.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Masukkan Access Code..."
              className={`w-full py-3 pl-4 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                error 
                  ? 'border-rose-500 focus:ring-rose-500/50' 
                  : (isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400')
              }`}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-purple-500 hover:scale-110 active:scale-95 transition-all"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-rose-500 text-xs text-center font-semibold animate-pulse">Kode akses tidak cocok!</p>}

          <button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 group"
          >
            Mulai Perjalanan <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <button onClick={toggleTheme} className="text-xs text-slate-400 hover:text-purple-500 flex items-center gap-2 mx-auto hover:scale-105 active:scale-95 transition-transform">
            {isDarkMode ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-purple-600" />} Ubah Tema
          </button>
        </div>
      </div>
    </div>
  );
};



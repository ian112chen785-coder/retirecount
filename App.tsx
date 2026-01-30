import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, PieChart, TrendingUp, Save, FolderOpen, Plus, Trash2, ArrowRight } from 'lucide-react';
import { CalculatorState, OneTimeEvent, SavedScenario, YearlyResult } from './types';
import { calculateCompoundInterest, calculateMonthlyDetails, formatCurrency, MonthlyDetail } from './utils/calculations';
import { Card, Button3D, InputGroup, Modal } from './components/UI';
import ChartSection from './components/ChartSection';
import AgeView from './components/AgeView';

const DEFAULT_STATE: CalculatorState = {
  initialPrincipal: 100000,
  monthlyContribution: 10000,
  annualRate: 6,
  yearsToGrow: 30,
  startAge: 25,
  retirementYear: 30, 
  monthlyWithdrawal: 0,
  oneTimeEvents: [],
};

function App() {
  const [state, setState] = useState<CalculatorState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<'chart' | 'age'>('chart');
  
  // Modals state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [detailModalYear, setDetailModalYear] = useState<number | null>(null);

  // Locking state
  const [lockedSections, setLockedSections] = useState({
    basic: false,
    retirement: false,
    events: false,
  });

  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  // Calculate results
  const results: YearlyResult[] = useMemo(() => calculateCompoundInterest(state), [state]);
  const finalResult = results[results.length - 1];

  // Calculate monthly details for the selected year (if any)
  const monthlyDetails: MonthlyDetail[] | null = useMemo(() => {
    if (detailModalYear === null) return null;
    return calculateMonthlyDetails(state, detailModalYear);
  }, [state, detailModalYear]);

  // Load scenarios
  useEffect(() => {
    const saved = localStorage.getItem('compound_scenarios');
    if (saved) {
      setSavedScenarios(JSON.parse(saved));
    }
  }, []);

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) return;
    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name: scenarioName,
      date: new Date().toLocaleDateString(),
      data: state,
    };
    const updated = [...savedScenarios, newScenario];
    setSavedScenarios(updated);
    localStorage.setItem('compound_scenarios', JSON.stringify(updated));
    setScenarioName('');
    setShowSaveModal(false);
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setState(scenario.data);
    setShowLoadModal(false);
  };

  const handleDeleteScenario = (id: string) => {
    const updated = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(updated);
    localStorage.setItem('compound_scenarios', JSON.stringify(updated));
  };

  const addEvent = () => {
    const newEvent: OneTimeEvent = {
      id: Date.now().toString(),
      year: Math.round(state.yearsToGrow / 2),
      amount: 100000,
      type: 'deposit', // Forced type
      name: `單筆投入 ${state.oneTimeEvents.length + 1}`,
    };
    setState({ ...state, oneTimeEvents: [...state.oneTimeEvents, newEvent] });
  };

  const updateEvent = (id: string, field: keyof OneTimeEvent, value: any) => {
    const updatedEvents = state.oneTimeEvents.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setState({ ...state, oneTimeEvents: updatedEvents });
  };

  const removeEvent = (id: string) => {
    setState({ ...state, oneTimeEvents: state.oneTimeEvents.filter((e) => e.id !== id) });
  };

  const toggleLock = (section: keyof typeof lockedSections) => {
    setLockedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4 md:p-8 font-sans selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-lg shadow-white/10">
              <TrendingUp size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-light tracking-wide text-white">Compound <span className="font-bold">Pro</span></h1>
              <p className="text-void-700 text-xs tracking-widest uppercase mt-1">Advanced Wealth Simulator</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button3D variant="neutral" onClick={() => setShowLoadModal(true)} className="px-5">
              <FolderOpen size={16} /> 讀取
            </Button3D>
            <Button3D variant="primary" onClick={() => setShowSaveModal(true)} className="px-5">
              <Save size={16} /> 儲存方案
            </Button3D>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-8">
            <Card 
              title="基礎設定" 
              isLocked={lockedSections.basic} 
              onToggleLock={() => toggleLock('basic')}
            >
              <InputGroup
                label="起始本金 (元)"
                value={state.initialPrincipal}
                disabled={lockedSections.basic}
                min={0}
                max={20000000}
                step={10000}
                onChange={(v) => setState({ ...state, initialPrincipal: v })}
              />
              <InputGroup
                label="每月定期投入 (元)"
                value={state.monthlyContribution}
                disabled={lockedSections.basic}
                min={0}
                max={1000000}
                step={1000}
                onChange={(v) => setState({ ...state, monthlyContribution: v })}
              />
               <InputGroup
                label="年化報酬率 (%)"
                value={state.annualRate}
                disabled={lockedSections.basic}
                min={0}
                max={20}
                step={0.1}
                unit="%"
                onChange={(v) => setState({ ...state, annualRate: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup
                  label="起始年齡"
                  value={state.startAge}
                  disabled={lockedSections.basic}
                  min={0}
                  max={80}
                  unit="歲"
                  onChange={(v) => setState({ ...state, startAge: v })}
                />
                 <InputGroup
                  label="複利年限"
                  value={state.yearsToGrow}
                  disabled={lockedSections.basic}
                  min={1}
                  max={100}
                  unit="年"
                  onChange={(v) => setState({ ...state, yearsToGrow: v })}
                />
              </div>
            </Card>

            <Card 
              title="退休提領規劃" 
              className="border-red-900/10"
              isLocked={lockedSections.retirement}
              onToggleLock={() => toggleLock('retirement')}
            >
              <InputGroup
                label="開始提領時間"
                value={state.retirementYear}
                disabled={lockedSections.retirement}
                min={1}
                max={state.yearsToGrow}
                unit={`年後 (${state.startAge + state.retirementYear}歲)`}
                helperText="此時間點後停止投入，並開始每月提領"
                onChange={(v) => setState({ ...state, retirementYear: v })}
              />
               <InputGroup
                label="退休後每月提領 (元)"
                value={state.monthlyWithdrawal}
                disabled={lockedSections.retirement}
                min={0}
                max={500000}
                step={1000}
                onChange={(v) => setState({ ...state, monthlyWithdrawal: v })}
              />
            </Card>

            <Card 
              title="單筆大額投入" 
              isLocked={lockedSections.events}
              onToggleLock={() => toggleLock('events')}
            >
               <div className="space-y-4">
                 {state.oneTimeEvents.map((event) => (
                   <div key={event.id} className="p-4 rounded-2xl bg-black border border-void-800 relative group transition-all hover:border-void-700">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-emerald-400 text-sm font-medium tracking-wide">
                           單筆投入
                        </span>
                        {!lockedSections.events && (
                          <button onClick={() => removeEvent(event.id)} className="text-void-700 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <label className="text-[10px] text-void-600 uppercase tracking-widest block mb-1">時間 (年後)</label>
                         <input 
                            type="number" 
                            disabled={lockedSections.events}
                            className="w-full bg-void-900 rounded-lg px-3 py-2 text-sm border border-void-800 focus:outline-none focus:border-white/30 text-white disabled:opacity-50"
                            value={event.year}
                            onChange={(e) => updateEvent(event.id, 'year', Number(e.target.value))}
                            min={1}
                            max={state.yearsToGrow}
                         />
                       </div>
                        <div>
                         <label className="text-[10px] text-void-600 uppercase tracking-widest block mb-1">金額</label>
                         <input 
                            type="number" 
                            disabled={lockedSections.events}
                            className="w-full bg-void-900 rounded-lg px-3 py-2 text-sm border border-void-800 focus:outline-none focus:border-white/30 text-emerald-400 font-mono disabled:opacity-50"
                            value={event.amount}
                            onChange={(e) => updateEvent(event.id, 'amount', Number(e.target.value))}
                            min={0}
                            max={2000000}
                         />
                       </div>
                     </div>
                   </div>
                 ))}
                 <Button3D variant="neutral" onClick={addEvent} disabled={lockedSections.events} className="w-full text-xs border-dashed bg-transparent hover:bg-void-900 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus size={14} className="inline mr-1" /> 新增投入計畫
                 </Button3D>
               </div>
            </Card>
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Top Cards: Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-void-900 to-black flex flex-col justify-center items-center text-center py-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-400 to-transparent opacity-50"></div>
                <div className="flex flex-col items-center gap-3 z-10 w-full px-2">
                  <span className="text-void-500 text-xs uppercase tracking-widest">預估總資產</span>
                  <span className="text-4xl md:text-5xl font-light text-white tracking-tight break-all leading-tight">
                    {formatCurrency(finalResult.totalAssets)}
                  </span>
                  <span className="text-void-600 text-[10px] bg-void-900 px-3 py-1 rounded-full border border-void-800 mt-2">
                    {state.yearsToGrow} 年後 | {state.startAge + state.yearsToGrow}歲
                  </span>
                </div>
              </Card>

               <Card className="flex flex-col justify-center items-center text-center py-8">
                <span className="text-void-500 text-xs uppercase tracking-widest mb-2">總投入本金</span>
                <span className="text-2xl md:text-3xl font-light text-emerald-400/90 tracking-tight">
                  {formatCurrency(finalResult.totalInvested)}
                </span>
              </Card>

              <Card className="flex flex-col justify-center items-center text-center py-8">
                <span className="text-void-500 text-xs uppercase tracking-widest mb-2">複利總收益</span>
                <span className="text-2xl md:text-3xl font-light text-accent-400/90 tracking-tight">
                  {formatCurrency(finalResult.totalAssets - finalResult.totalInvested)}
                </span>
              </Card>
            </div>

            {/* Main Visualizer */}
            <Card className="flex-1 flex flex-col min-h-[600px] p-0 overflow-hidden">
              <div className="flex gap-2 p-4 border-b border-void-800 bg-void-950">
                 <button
                   className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'chart' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-void-500 hover:text-white hover:bg-void-900'}`}
                   onClick={() => setActiveTab('chart')}
                 >
                   <LineChart size={16} /> 資產趨勢
                 </button>
                 <button
                   className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'age' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-void-500 hover:text-white hover:bg-void-900'}`}
                   onClick={() => setActiveTab('age')}
                 >
                   <PieChart size={16} /> 年齡目標
                 </button>
              </div>

              <div className="flex-1 p-4 bg-black">
                {activeTab === 'chart' ? (
                  <ChartSection data={results} retirementYear={state.retirementYear} />
                ) : (
                  <AgeView data={results} onYearClick={(year) => setDetailModalYear(year)} />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      <Modal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)}
        title="儲存您的財富藍圖"
      >
        <div className="space-y-6">
          <p className="text-void-500 text-sm">請為此設定輸入一個名稱，方便日後讀取。</p>
          <input 
            type="text" 
            placeholder="例如: 30歲存股退休計畫..."
            className="w-full bg-void-950 border border-void-800 p-4 rounded-xl text-white focus:border-white/50 outline-none transition-colors"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
             <Button3D variant="neutral" onClick={() => setShowSaveModal(false)}>取消</Button3D>
             <Button3D variant="primary" onClick={handleSaveScenario}>確認儲存</Button3D>
          </div>
        </div>
      </Modal>

      {/* Load Modal */}
      <Modal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        title="讀取已存方案"
      >
         {savedScenarios.length === 0 ? (
           <div className="text-center py-16 text-void-600">
             <p>目前沒有儲存的方案。</p>
           </div>
         ) : (
           <div className="grid gap-3">
             {savedScenarios.map((s) => (
               <div key={s.id} className="bg-void-950 border border-void-800 p-5 rounded-2xl flex justify-between items-center group hover:border-void-600 transition-colors">
                  <div>
                    <h4 className="font-medium text-lg text-gray-200 group-hover:text-white transition-colors">{s.name}</h4>
                    <p className="text-xs text-void-600 mt-1">{s.date} • <span className="text-emerald-500">{s.data.annualRate}%</span> 年化</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleLoadScenario(s)}
                      className="p-3 bg-white/5 text-white rounded-full hover:bg-white hover:text-black transition-all"
                      title="讀取"
                    >
                      <ArrowRight size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteScenario(s.id)}
                      className="p-3 bg-red-900/10 text-red-500 rounded-full hover:bg-red-900/30 transition-all"
                      title="刪除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
               </div>
             ))}
           </div>
         )}
      </Modal>

      {/* Monthly Detail Modal */}
      <Modal
        isOpen={detailModalYear !== null}
        onClose={() => setDetailModalYear(null)}
        title={detailModalYear !== null ? `${state.startAge + detailModalYear} 歲 - 月度資產目標詳情` : ''}
      >
        <div className="overflow-hidden rounded-xl border border-void-800">
           <table className="w-full text-left border-collapse text-sm">
             <thead>
               <tr className="bg-void-950 text-void-500 uppercase text-xs tracking-wider">
                 <th className="p-3 border-b border-void-800">月份</th>
                 <th className="p-3 border-b border-void-800 text-right">月初金額</th>
                 <th className="p-3 border-b border-void-800 text-right">當月損益/投入</th>
                 <th className="p-3 border-b border-void-800 text-right">當月利息</th>
                 <th className="p-3 border-b border-void-800 text-right">月底結餘</th>
               </tr>
             </thead>
             <tbody>
               {monthlyDetails?.map((m) => (
                 <tr key={m.month} className="border-b border-void-800/50 hover:bg-void-800/30 transition-colors">
                   <td className="p-3 text-void-400 font-mono">Month {m.month}</td>
                   <td className="p-3 text-right text-void-300 font-mono">{formatCurrency(m.startBalance)}</td>
                   <td className={`p-3 text-right font-mono ${m.contribution >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                     {m.contribution > 0 ? '+' : ''}{formatCurrency(m.contribution)}
                   </td>
                   <td className="p-3 text-right text-accent-400 font-mono">+{formatCurrency(m.interest)}</td>
                   <td className="p-3 text-right font-bold text-white font-mono">{formatCurrency(m.endBalance)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
           <div className="p-4 bg-void-950/50 text-xs text-void-500 text-center">
             * 註：此表為基於目前設定之試算模擬，實際利息計算可能因天數差異略有不同。
           </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
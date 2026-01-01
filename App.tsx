
import React, { useState, useEffect, useMemo } from 'react';
import { Ink, UsageRecord, ViewType } from './types';
import { storageService } from './services/storageService';
import Shelf from './components/Shelf';
import Statistics from './components/Statistics';
import Management from './components/Management';
import InkBottle from './components/InkBottle';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewType>('shelf');
  const [inks, setInks] = useState<Ink[]>([]);
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [selectedInk, setSelectedInk] = useState<Ink | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setInks(storageService.getInks());
    setRecords(storageService.getRecords());
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddInk = (newInk: Ink) => {
    const updated = [...inks, newInk];
    setInks(updated);
    storageService.saveInks(updated);
    showToast(`墨水 "${newInk.name}" 已上架`);
  };

  const handleUpdateInk = (updatedInk: Ink) => {
    const updated = inks.map(i => i.id === updatedInk.id ? updatedInk : i);
    setInks(updated);
    storageService.saveInks(updated);
    showToast('墨水信息已更新');
  };

  const handleDeleteInk = (id: string) => {
    const updatedInks = inks.filter(i => i.id !== id);
    const updatedRecords = records.filter(r => r.inkId !== id);
    setInks(updatedInks);
    setRecords(updatedRecords);
    storageService.saveInks(updatedInks);
    storageService.saveRecords(updatedRecords);
    setSelectedInk(null);
    showToast('墨水已移除');
  };

  const handleAddRecord = (record: UsageRecord) => {
    const ink = inks.find(i => i.id === record.inkId);
    if (!ink) return;

    if (ink.remaining < record.amount) {
      showToast('墨水余量不足', 'error');
      return;
    }

    const updatedInk = { ...ink, remaining: Math.max(0, ink.remaining - record.amount) };
    const updatedInks = inks.map(i => i.id === ink.id ? updatedInk : i);
    const updatedRecords = [record, ...records];

    setInks(updatedInks);
    setRecords(updatedRecords);
    storageService.saveInks(updatedInks);
    storageService.saveRecords(updatedRecords);
    
    showToast(`记录成功: 使用了 ${record.amount}ml ${ink.name}`);
  };

  const handleDeleteRecord = (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    const ink = inks.find(i => i.id === record.inkId);
    if (ink) {
      const updatedInk = { ...ink, remaining: Math.min(ink.capacity, ink.remaining + record.amount) };
      const updatedInks = inks.map(i => i.id === ink.id ? updatedInk : i);
      setInks(updatedInks);
      storageService.saveInks(updatedInks);
    }

    const updatedRecords = records.filter(r => r.id !== id);
    setRecords(updatedRecords);
    storageService.saveRecords(updatedRecords);
    showToast('记录已撤回');
  };

  const brands = useMemo(() => Array.from(new Set(inks.map(i => i.brand))).sort(), [inks]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-md border-b-2 border-[#c9a66b] py-8 text-center sticky top-0 z-30 shadow-sm">
        <h1 className="font-header text-4xl md:text-5xl text-[#2c1810] flex items-center justify-center gap-3">
          <span className="text-[#c9a66b]">✒️</span> 墨色乾坤
        </h1>
        <p className="text-[#5a4030] mt-2 opacity-80 tracking-widest text-sm">记录每一滴墨水的故事</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-2 mb-8 sticky top-28 z-20">
          {[
            { id: 'shelf', label: '墨水架', icon: '🏛️' },
            { id: 'refill', label: '上墨记录', icon: '💧' },
            { id: 'stats', label: '数据统计', icon: '📊' },
            { id: 'manage', label: '管理库', icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ViewType)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all border-2 shadow-sm
                ${activeTab === tab.id 
                  ? 'bg-[#c9a66b] text-white border-[#c9a66b] scale-105' 
                  : 'bg-white/80 text-[#5a4030] border-[#d4c4a8] hover:border-[#c9a66b]'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Views */}
        <div className="bg-white/40 backdrop-blur-[2px] rounded-3xl p-6 min-h-[60vh] border-2 border-white/50 shadow-inner">
          {activeTab === 'shelf' && (
            <section className="animate-in fade-in duration-500">
              <div className="flex flex-wrap gap-4 mb-8">
                <input 
                  type="text" 
                  placeholder="搜索名称或品牌..." 
                  className="flex-1 min-w-[200px] p-3 rounded-xl border-2 border-[#d4c4a8] bg-white/80 focus:border-[#c9a66b] outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                  className="p-3 rounded-xl border-2 border-[#d4c4a8] bg-white/80 focus:border-[#c9a66b] outline-none"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                >
                  <option value="">所有品牌</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <Shelf 
                inks={inks} 
                onBottleClick={setSelectedInk} 
                searchTerm={searchTerm} 
                brandFilter={brandFilter} 
              />
            </section>
          )}

          {activeTab === 'refill' && (
            <section className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl p-8 shadow-md border border-[#d4c4a8] mb-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-blue-500">💧</span> 新增上墨记录
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const inkId = formData.get('inkId') as string;
                    const amount = parseFloat(formData.get('amount') as string);
                    if (!inkId || isNaN(amount)) return;
                    
                    handleAddRecord({
                      id: Date.now().toString(),
                      inkId,
                      amount,
                      date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
                      note: formData.get('note') as string,
                      createdAt: new Date().toISOString()
                    });
                    e.currentTarget.reset();
                  }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">选择墨水</label>
                      <select name="inkId" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#c9a66b] outline-none" required>
                        <option value="">- 选择瓶子 -</option>
                        {inks.map(i => <option key={i.id} value={i.id}>{i.brand} - {i.name} ({i.remaining}ml 剩余)</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">用量 (ml)</label>
                      <input type="number" name="amount" step="0.1" defaultValue="0.5" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#c9a66b] outline-none" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">上墨日期</label>
                    <input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#c9a66b] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">笔记</label>
                    <input type="text" name="note" placeholder="例如：百利金M800 灌装..." className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#c9a66b] outline-none" />
                  </div>
                  <button className="w-full py-4 bg-gradient-to-r from-[#c9a66b] to-[#8b6914] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                    确 认 上 墨
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold flex items-center gap-2 px-2">
                  <span>📜</span> 最近记录
                </h4>
                {records.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">尚无上墨记录</p>
                ) : (
                  records.slice(0, 10).map(record => {
                    const ink = inks.find(i => i.id === record.inkId);
                    return (
                      <div key={record.id} className="bg-white/80 p-4 rounded-xl border border-[#d4c4a8] flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ink?.color || '#ccc' }} />
                          <div>
                            <p className="font-bold text-sm">{ink?.name || '未知墨水'}</p>
                            <p className="text-xs text-gray-500">{record.date} • {record.note || '无笔记'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold">{record.amount}ml</span>
                          <button 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {activeTab === 'stats' && (
            <section className="animate-in fade-in duration-700">
              <Statistics inks={inks} records={records} />
            </section>
          )}

          {activeTab === 'manage' && (
            <section className="animate-in fade-in duration-500">
              <Management inks={inks} onAdd={handleAddInk} onUpdate={handleUpdateInk} onDelete={handleDeleteInk} />
            </section>
          )}
        </div>
      </main>

      {/* Ink Detail Modal */}
      {selectedInk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f5f0e8] rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-[#c9a66b] animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedInk(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white rounded-full text-2xl hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
            
            <div className="flex flex-col items-center">
              <InkBottle ink={selectedInk} onClick={() => {}} size="lg" />
              <h2 className="text-2xl font-bold mt-4" style={{ color: selectedInk.color }}>{selectedInk.name}</h2>
              <p className="text-gray-500">{selectedInk.brand}</p>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-8">
                <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                  <p className="text-xs text-gray-400">总容量</p>
                  <p className="text-lg font-bold">{selectedInk.capacity}ml</p>
                </div>
                <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                  <p className="text-xs text-gray-400">当前剩余</p>
                  <p className="text-lg font-bold">{selectedInk.remaining}ml</p>
                </div>
              </div>

              <div className="w-full h-4 bg-gray-200 rounded-full mt-6 overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ 
                    width: `${(selectedInk.remaining / selectedInk.capacity) * 100}%`,
                    backgroundColor: selectedInk.color
                  }}
                />
              </div>

              <div className="flex gap-4 w-full mt-10">
                <button 
                  onClick={() => {
                    setActiveTab('refill');
                    setSelectedInk(null);
                  }}
                  className="flex-1 py-3 bg-[#c9a66b] text-white rounded-xl font-bold hover:brightness-110"
                >
                  去上墨
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('manage');
                    setSelectedInk(null);
                  }}
                  className="flex-1 py-3 bg-white text-[#c9a66b] border-2 border-[#c9a66b] rounded-xl font-bold hover:bg-gray-50"
                >
                  修改资料
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 animate-in slide-in-from-bottom-8 duration-300
          ${toast.type === 'success' ? 'bg-[#c9a66b]' : 'bg-red-500'}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;

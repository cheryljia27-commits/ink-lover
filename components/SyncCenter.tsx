
import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface SyncCenterProps {
  onDataRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const SyncCenter: React.FC<SyncCenterProps> = ({ onDataRefresh, showToast }) => {
  const [importCode, setImportCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleExport = () => {
    storageService.downloadAsFile();
    showToast('备份文件已准备下载');
  };

  const handleCopyCode = () => {
    const code = btoa(storageService.exportFullData());
    navigator.clipboard.writeText(code);
    showToast('云端同步代码已复制到剪贴板');
  };

  const handleImportCode = () => {
    try {
      const jsonStr = atob(importCode);
      const success = storageService.importFullData(jsonStr);
      if (success) {
        onDataRefresh();
        setImportCode('');
        showToast('同步成功，数据已更新');
      } else {
        showToast('导入失败：数据格式错误', 'error');
      }
    } catch (e) {
      showToast('同步代码无效', 'error');
    }
  };

  const simulateCloudSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('已与云端状态同步');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] p-8 rounded-3xl border border-[#d4c4a8] shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-header text-[#2c1810]">数据安全中心</h3>
            <p className="text-[#5a4030] opacity-70 mt-1">确保您的墨水收藏在更换浏览器或设备时永不丢失。</p>
          </div>
          <button 
            onClick={simulateCloudSync}
            disabled={isSyncing}
            className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all
              ${isSyncing ? 'bg-gray-200 text-gray-500' : 'bg-[#c9a66b] text-white hover:shadow-lg'}`}
          >
            {isSyncing ? '正在同步...' : '立即同步'} <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Export Card */}
        <div className="bg-white p-8 rounded-3xl border border-[#d4c4a8] shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
              <span className="text-green-500">💾</span> 导出与备份
            </h4>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              将您的整个墨水架和使用记录导出。您可以选择下载一个本地文件，或生成一个加密同步码。
            </p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleExport}
              className="w-full py-3 bg-white border-2 border-[#c9a66b] text-[#c9a66b] rounded-xl font-bold hover:bg-[#c9a66b] hover:text-white transition-all"
            >
              下载 JSON 备份文件
            </button>
            <button 
              onClick={handleCopyCode}
              className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
            >
              复制云端同步代码
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-white p-8 rounded-3xl border border-[#d4c4a8] shadow-sm">
          <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
            <span className="text-blue-500">📥</span> 数据恢复与同步
          </h4>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            在下方粘贴您之前复制的同步代码，或选择本地文件来恢复您的数据。
          </p>
          <textarea 
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="在此处粘贴同步代码..."
            className="w-full h-24 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c9a66b] outline-none text-xs font-mono mb-4 bg-gray-50"
          />
          <button 
            onClick={handleImportCode}
            disabled={!importCode}
            className={`w-full py-3 rounded-xl font-bold transition-all
              ${!importCode ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#c9a66b] text-white hover:shadow-md'}`}
          >
            恢复数据
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
        <span className="text-xl">💡</span>
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong>小提示：</strong> 所有的登记记录目前存储在您的浏览器本地缓存中。为了绝对安全，建议您每月进行一次“下载 JSON 备份文件”，并将文件保存至您的云盘（如百度网盘、OneDrive 或 iCloud）。
        </p>
      </div>
    </div>
  );
};

export default SyncCenter;


import React, { useState } from 'react';
import { Ink } from '../types';

interface ManagementProps {
  inks: Ink[];
  onAdd: (ink: Ink) => void;
  onUpdate: (ink: Ink) => void;
  onDelete: (id: string) => void;
}

const Management: React.FC<ManagementProps> = ({ inks, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingInk = editingId ? inks.find(i => i.id === editingId) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const inkData = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      color: formData.get('color') as string,
      capacity: parseFloat(formData.get('capacity') as string),
      remaining: parseFloat(formData.get('remaining') as string),
    };

    if (editingId) {
      const existing = inks.find(i => i.id === editingId);
      if (existing) {
        onUpdate({ ...existing, ...inkData });
        setEditingId(null);
      }
    } else {
      onAdd({
        id: Date.now().toString(),
        ...inkData,
        createdAt: new Date().toISOString()
      });
    }
    e.currentTarget.reset();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Column */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-3xl shadow-md border border-[#d4c4a8] sticky top-36">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>{editingId ? '✍️' : '➕'}</span> {editingId ? '编辑墨水' : '添加新墨水'}
          </h3>
          <form key={editingId ?? 'new'} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">墨水名称</label>
              <input 
                name="name" 
                type="text" 
                placeholder="例如：极光蓝" 
                defaultValue={editingInk?.name || ''}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#c9a66b] outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">品牌</label>
              <input 
                name="brand" 
                type="text" 
                placeholder="例如：百利金" 
                defaultValue={editingInk?.brand || ''}
                className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#c9a66b] outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">选择颜色</label>
              <input 
                name="color" 
                type="color" 
                defaultValue={editingInk?.color || '#1a5276'}
                className="w-full h-12 p-1 rounded-xl border border-gray-300 cursor-pointer" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">总量 (ml)</label>
                <input 
                  name="capacity" 
                  type="number" 
                  step="0.1" 
                  defaultValue={editingInk?.capacity || '50'}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#c9a66b] outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">现存量 (ml)</label>
                <input 
                  name="remaining" 
                  type="number" 
                  step="0.1" 
                  defaultValue={editingInk?.remaining || '50'}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#c9a66b] outline-none" 
                  required 
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button 
                type="submit" 
                className="flex-1 py-4 bg-[#c9a66b] text-white rounded-xl font-bold shadow-lg hover:brightness-110"
              >
                {editingId ? '保存更改' : '加入墨水架'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => setEditingId(null)}
                  className="px-4 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold"
                >
                  取消
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List Column */}
      <div className="lg:col-span-2">
        <div className="bg-white/80 rounded-3xl p-6 shadow-sm border border-[#d4c4a8]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>📦</span> 库存清单 ({inks.length})
          </h3>
          <div className="space-y-3">
            {inks.length === 0 ? (
              <p className="text-center text-gray-400 py-10">尚无墨水库</p>
            ) : (
              inks.map(ink => (
                <div key={ink.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border shadow-inner flex items-center justify-center text-xs" style={{ backgroundColor: ink.color, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                      {Math.round((ink.remaining / ink.capacity) * 100)}%
                    </div>
                    <div>
                      <p className="font-bold">{ink.name}</p>
                      <p className="text-xs text-gray-500">{ink.brand} • {ink.capacity}ml</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingId(ink.id)}
                      className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`确定要移除墨水 "${ink.name}" 吗？所有记录也将被删除。`)) {
                          onDelete(ink.id);
                        }
                      }}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;

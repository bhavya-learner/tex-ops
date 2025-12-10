import React, { useState } from 'react';
import { Trash2, AlertTriangle, Edit2, Check, X, Tag } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  items: InventoryItem[];
  onDelete: (id: string) => void;
  onUpdate: (item: InventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ items, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InventoryItem | null>(null);

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = () => {
    if (editForm) {
      onUpdate({ ...editForm, lastUpdated: new Date().toLocaleDateString() });
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    if (editForm) setEditForm({ ...editForm, [field]: value });
  };

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
         <div className="text-6xl mb-4">📦</div>
         <p className="text-white text-lg font-bold">Inventory is empty.</p>
         <p className="text-slate-400 mt-1">Upload photos of your shelves to fill this up!</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <div className="p-6 bg-slate-900/30 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white">Current Stock</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left modern-table">
          <thead className="bg-slate-900/40">
            <tr>
              <th className="pl-6 pt-5">Item Name</th>
              <th className="pt-5 text-center">Qty</th>
              <th className="pt-5">Color Code</th>
              <th className="pt-5">Last Updated</th>
              <th className="pt-5 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const isLowStock = item.quantity < 50;
              
              return (
                <tr key={item.id} className={isEditing ? 'bg-indigo-500/5' : ''}>
                  <td className="pl-6 font-semibold text-slate-200">
                    {isEditing ? (
                      <input 
                        value={editForm?.name} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="glass-input p-2 w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {isLowStock && <AlertTriangle size={16} className="text-amber-500 animate-pulse" />}
                        <span className={isLowStock ? 'text-amber-200' : 'text-slate-100'}>{item.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="text-center">
                    {isEditing ? (
                       <input 
                       type="number" 
                       value={editForm?.quantity} 
                       onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                       className="glass-input p-2 w-20 text-center"
                     />
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isLowStock ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                       <div className="space-y-2">
                           <input value={editForm?.color} onChange={(e) => handleInputChange('color', e.target.value)} className="glass-input p-2 w-full text-xs" />
                           <input value={editForm?.colorCode} onChange={(e) => handleInputChange('colorCode', e.target.value)} className="glass-input p-2 w-full text-xs" placeholder="#" />
                       </div>
                    ) : (
                      <div>
                          <p className="text-sm text-slate-300">{item.color}</p>
                          {item.colorCode && <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{item.colorCode}</span>}
                      </div>
                    )}
                  </td>
                  <td className="text-xs text-slate-500">{isEditing ? 'Now' : item.lastUpdated}</td>
                  <td className="text-right pr-6">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={saveEditing} className="p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg"><Check size={16} /></button>
                        <button onClick={cancelEditing} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEditing(item)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
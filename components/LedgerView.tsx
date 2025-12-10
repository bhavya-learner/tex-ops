import React, { useState } from 'react';
import { InvoiceRecord, InvoiceItem } from '../types';
import { FileText, IndianRupee, Calendar, Edit2, Plus, Trash2, ChevronDown, ChevronUp, FolderOpen } from 'lucide-react';

interface LedgerViewProps {
  invoices: InvoiceRecord[];
  onUpdate: (invoice: InvoiceRecord) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ invoices, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<InvoiceRecord | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalSpend = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

  const startEditing = (inv: InvoiceRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(inv.id);
    setEditForm(JSON.parse(JSON.stringify(inv))); // Deep copy
    setExpandedId(inv.id);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editForm) {
      onUpdate(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const toggleExpand = (id: string) => {
    if (editingId) return;
    setExpandedId(expandedId === id ? null : id);
  };

  const calculateTotal = (record: InvoiceRecord) => {
     const subtotal = record.items.reduce((sum, item) => sum + (item.total || 0), 0);
     const tax = Number(record.taxAmount) || 0;
     return subtotal + tax;
  };

  const handleInputChange = (field: keyof InvoiceRecord, value: string | number) => {
    if (editForm) {
      const updated = { ...editForm, [field]: value };
      if (field === 'taxAmount') {
         updated.totalAmount = calculateTotal(updated);
      }
      setEditForm(updated);
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    if (editForm) {
      const newItems = [...editForm.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Auto calculate row total
      if (field === 'quantity' || field === 'unitPrice') {
         newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
      }
      
      const updatedForm = { ...editForm, items: newItems };
      // Auto calculate grand total
      updatedForm.totalAmount = calculateTotal(updatedForm);
      
      setEditForm(updatedForm);
    }
  };

  const addItem = () => {
    if (editForm) {
      setEditForm({
        ...editForm,
        items: [...editForm.items, { name: '', quantity: 0, unitPrice: 0, total: 0 }]
      });
    }
  };

  const removeItem = (index: number) => {
    if (editForm) {
        const newItems = editForm.items.filter((_, i) => i !== index);
        const updatedForm = { ...editForm, items: newItems };
        updatedForm.totalAmount = calculateTotal(updatedForm);
        setEditForm(updatedForm);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Invoices List */}
      <div className="glass-card overflow-hidden">
         <div className="px-8 py-6 border-b border-slate-700/30 flex justify-between items-center bg-slate-900/30">
             <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <FileText className="text-indigo-400" />
                Purchases Ledger
             </h3>
         </div>

         {invoices.length === 0 ? (
             <div className="py-24 text-center flex flex-col items-center">
                 <div className="text-6xl mb-4">📂</div>
                 <p className="text-white text-lg font-bold">No invoices found.</p>
                 <p className="text-slate-400 mt-1">Start by scanning one from the home screen!</p>
             </div>
         ) : (
             <div className="divide-y divide-slate-700/30">
                 {invoices.map((inv) => {
                     const isEditing = editingId === inv.id;
                     const isExpanded = expandedId === inv.id || isEditing;

                     return (
                         <div 
                           key={inv.id} 
                           className={`transition-all duration-300 ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}
                         >
                             {/* Summary Row */}
                             <div 
                                className="p-6 cursor-pointer grid grid-cols-12 gap-4 items-center"
                                onClick={() => toggleExpand(inv.id)}
                             >
                                 <div className="col-span-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                 </div>
                                 <div className="col-span-6">
                                     <h4 className="text-base font-bold text-white">{inv.vendorName || "Unknown Vendor"}</h4>
                                     <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {inv.date}</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <span>{inv.items.length} Items</span>
                                     </div>
                                 </div>
                                 <div className="col-span-5 text-right">
                                     <span className="text-xl font-bold font-mono text-emerald-400">₹{Number(inv.totalAmount).toLocaleString()}</span>
                                     <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Total</p>
                                 </div>
                             </div>

                             {/* Expanded Details */}
                             {isExpanded && (
                                <div className="px-6 pb-8 pt-2 animate-fade-in border-t border-dashed border-slate-700/50">
                                    <div className="space-y-6">
                                        
                                        {/* Edit Form Header */}
                                        {isEditing && (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Vendor</label>
                                                    <input 
                                                        className="glass-input w-full p-2.5"
                                                        value={editForm?.vendorName}
                                                        onChange={(e) => handleInputChange('vendorName', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Date</label>
                                                    <input 
                                                        className="glass-input w-full p-2.5"
                                                        type="date"
                                                        value={editForm?.date}
                                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Tax (₹)</label>
                                                    <input 
                                                        className="glass-input w-full p-2.5 font-mono text-amber-300"
                                                        type="number"
                                                        value={editForm?.taxAmount}
                                                        onChange={(e) => handleInputChange('taxAmount', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total (₹)</label>
                                                    <div className="glass-input w-full p-2.5 font-mono text-emerald-400 bg-emerald-500/5 border-emerald-500/20">
                                                        {editForm?.totalAmount}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Detailed Items Table */}
                                        <div className="bg-slate-900/30 rounded-2xl overflow-hidden border border-slate-700/50">
                                            <table className="w-full text-left modern-table">
                                                <thead className="bg-slate-900/50">
                                                    <tr>
                                                        <th className="pl-6 pt-5">Item Details</th>
                                                        <th className="pt-5 text-center">Qty</th>
                                                        <th className="pt-5 text-right">Unit Price</th>
                                                        <th className="pt-5 text-right pr-6">Line Total</th>
                                                        {isEditing && <th className="pt-5 text-center">Remove</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(isEditing ? editForm?.items : inv.items)?.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="pl-6 font-medium text-slate-200">
                                                                {isEditing ? (
                                                                    <input 
                                                                      value={item.name}
                                                                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                                                      className="glass-input w-full p-2"
                                                                      placeholder="Item Name"
                                                                    />
                                                                ) : item.name}
                                                            </td>
                                                            <td className="text-center">
                                                                {isEditing ? (
                                                                    <input 
                                                                      type="number"
                                                                      value={item.quantity}
                                                                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                                      className="glass-input w-20 p-2 text-center"
                                                                    />
                                                                ) : <span className="text-slate-400">{item.quantity}</span>}
                                                            </td>
                                                            <td className="text-right">
                                                                {isEditing ? (
                                                                    <input 
                                                                      type="number"
                                                                      value={item.unitPrice}
                                                                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                                                      className="glass-input w-24 p-2 text-right font-mono"
                                                                    />
                                                                ) : <span className="font-mono text-slate-400">₹{item.unitPrice}</span>}
                                                            </td>
                                                            <td className="text-right pr-6">
                                                                <span className="font-mono text-emerald-300 font-bold">₹{item.total}</span>
                                                            </td>
                                                            {isEditing && (
                                                                <td className="text-center">
                                                                    <button onClick={() => removeItem(idx)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {isEditing && (
                                                <button onClick={addItem} className="w-full py-3 text-sm text-indigo-400 hover:bg-indigo-500/10 font-bold flex items-center justify-center gap-2 transition-colors border-t border-slate-700/50">
                                                    <Plus size={16} /> Add New Item Row
                                                </button>
                                            )}
                                        </div>
                                        
                                        {!isEditing && (
                                            <div className="flex justify-between items-center px-2">
                                                <div className="text-xs text-slate-500">
                                                    GST/Tax: <span className="text-slate-300 font-mono ml-1">₹{Number(inv.taxAmount || 0)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex justify-end gap-4 pt-2">
                                            {isEditing ? (
                                                <>
                                                    <button onClick={cancelEditing} className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-colors">Cancel</button>
                                                    <button onClick={saveEditing} className="btn-hyper px-6 py-2.5 text-sm shadow-lg">Save Updates</button>
                                                </>
                                            ) : (
                                                <button 
                                                    onClick={(e) => startEditing(inv, e)}
                                                    className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
                                                >
                                                    <Edit2 size={14} /> Edit Invoice
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                             )}
                         </div>
                     );
                 })}
             </div>
         )}
      </div>
    </div>
  );
};
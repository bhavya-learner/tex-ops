import React, { useState, useEffect } from 'react';
import { FileText, Box, PenTool, AlertCircle, Save, Plus, Trash2, Calendar, Hash, User, DollarSign } from 'lucide-react';
import { AnalysisResult, ImageCategory, InvoiceDetails, InvoiceItem } from '../types';

interface ResultCardProps {
  data: AnalysisResult;
  onSaveInvoice?: (data: InvoiceDetails) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onSaveInvoice }) => {
  const [editableInvoice, setEditableInvoice] = useState<InvoiceDetails>({
    date: '', totalAmount: 0, gstNumber: '', vendorName: '', taxAmount: 0, items: []
  });
  
  useEffect(() => {
    if (data.invoiceData) {
      setEditableInvoice({
        date: data.invoiceData.date || '',
        totalAmount: data.invoiceData.totalAmount || 0,
        gstNumber: data.invoiceData.gstNumber || '',
        vendorName: data.invoiceData.vendorName || '',
        taxAmount: data.invoiceData.taxAmount || 0,
        items: data.invoiceData.items && data.invoiceData.items.length > 0 ? data.invoiceData.items : [{ name: '', quantity: 0, unitPrice: 0, total: 0 }]
      });
    }
  }, [data]);

  const handleInvoiceChange = (field: keyof InvoiceDetails, value: string | number) => setEditableInvoice(prev => ({ ...prev, [field]: value }));
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...(editableInvoice.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
       newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
    }
    setEditableInvoice(prev => ({ ...prev, items: newItems }));
  };
  const addItem = () => setEditableInvoice(prev => ({ ...prev, items: [...(prev.items || []), { name: '', quantity: 0, unitPrice: 0, total: 0 }] }));
  const removeItem = (index: number) => setEditableInvoice(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== index) }));
  const handleSave = () => onSaveInvoice && onSaveInvoice(editableInvoice);

  return (
    <div className="glass-card p-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-2xl ${data.category === ImageCategory.INVOICE ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {data.category === ImageCategory.INVOICE ? <FileText size={24} /> : <Box size={24} />}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{data.category} Detected</h2>
                <p className="text-slate-400">{data.summary}</p>
            </div>
        </div>

        {data.category === ImageCategory.INVOICE && (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Vendor</label><input className="glass-input w-full p-3" value={editableInvoice.vendorName} onChange={(e) => handleInvoiceChange('vendorName', e.target.value)} /></div>
                    <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Date</label><input className="glass-input w-full p-3" type="date" value={editableInvoice.date} onChange={(e) => handleInvoiceChange('date', e.target.value)} /></div>
                </div>

                <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Line Items</p>
                    {editableInvoice.items?.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                            <input className="col-span-5 glass-input p-2" placeholder="Item" value={item.name} onChange={(e) => handleItemChange(i, 'name', e.target.value)} />
                            <input className="col-span-2 glass-input p-2 text-center" placeholder="Qty" type="number" value={item.quantity} onChange={(e) => handleItemChange(i, 'quantity', e.target.value)} />
                            <input className="col-span-3 glass-input p-2 text-right" placeholder="Price" type="number" value={item.unitPrice} onChange={(e) => handleItemChange(i, 'unitPrice', e.target.value)} />
                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <span className="text-xs font-mono text-emerald-400">₹{item.total}</span>
                                <button onClick={() => removeItem(i)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={addItem} className="text-xs font-bold text-indigo-400 mt-2 flex items-center gap-1 hover:underline"><Plus size={12} /> Add Item</button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Tax</label><input className="glass-input w-full p-3 font-mono text-amber-300" type="number" value={editableInvoice.taxAmount} onChange={(e) => handleInvoiceChange('taxAmount', e.target.value)} /></div>
                   <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Total</label><input className="glass-input w-full p-3 font-mono text-emerald-400 font-bold" type="number" value={editableInvoice.totalAmount} onChange={(e) => handleInvoiceChange('totalAmount', e.target.value)} /></div>
                </div>

                <button onClick={handleSave} className="btn-hyper w-full py-4 text-lg font-bold shadow-2xl mt-4 flex items-center justify-center gap-2">
                    <Save size={20} /> Save to Ledger & Update Stock
                </button>
            </div>
        )}

        {data.category === ImageCategory.SHELF && data.shelfData && (
             <div className="grid grid-cols-2 gap-4">
                 <div className="glass-card bg-slate-800/50 p-6 text-center">
                    <p className="text-3xl font-extrabold text-white mb-1">{data.shelfData.itemCount}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Items Detected</p>
                 </div>
                 <div className="glass-card bg-slate-800/50 p-6 text-center">
                    <p className="text-xl font-bold text-amber-400 mb-1">{data.shelfData.quantityEstimate}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Stock Level</p>
                 </div>
             </div>
        )}
    </div>
  );
};
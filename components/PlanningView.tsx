import React, { useState } from 'react';
import { InventoryItem, Order, OrderRequirement } from '../types';
import { Target, AlertOctagon, Copy, MessageCircle, Plus, Trash2, Box, Save, CheckCircle2, Clock } from 'lucide-react';

interface PlanningViewProps {
  inventory: InventoryItem[];
  orders: Order[];
  onSaveOrder: (name: string, reqs: OrderRequirement[]) => void;
  onCompleteOrder: (orderId: string) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ inventory, orders, onSaveOrder, onCompleteOrder }) => {
  const [activeSubTab, setActiveSubTab] = useState<'new' | 'history'>('new');
  const [orderName, setOrderName] = useState('');
  const [requirements, setRequirements] = useState<OrderRequirement[]>([{ inventoryItemId: '', inventoryItemName: '', amountNeeded: 0 }]);
  const [planResult, setPlanResult] = useState<{ shortages: any[], sufficient: boolean } | null>(null);

  // Logic omitted for brevity as it remains mostly same, just updating UI classes
  const addRequirement = () => setRequirements([...requirements, { inventoryItemId: '', inventoryItemName: '', amountNeeded: 0 }]);
  const removeRequirement = (index: number) => setRequirements(requirements.filter((_, i) => i !== index));
  const updateRequirement = (index: number, field: keyof OrderRequirement, value: string | number) => {
    const newReqs = [...requirements];
    if (field === 'inventoryItemId') {
      const item = inventory.find(i => i.id === value);
      newReqs[index] = { ...newReqs[index], inventoryItemId: value as string, inventoryItemName: item ? item.name : '' };
    } else {
      newReqs[index] = { ...newReqs[index], [field]: value };
    }
    setRequirements(newReqs);
    setPlanResult(null);
  };

  const checkPlan = () => {
    const shortages: any[] = [];
    requirements.forEach(req => {
      const item = inventory.find(i => i.id === req.inventoryItemId);
      if (item && req.amountNeeded > item.quantity) {
        shortages.push({ name: item.name, needed: req.amountNeeded, have: item.quantity, diff: req.amountNeeded - item.quantity });
      }
    });
    setPlanResult({ shortages, sufficient: shortages.length === 0 });
  };
 const handleWhatsApp = (item: string, qtyNeeded: number, colorCode: string) => {
  // 1. Create the message
  const message = `Namaste, urgent requirement for order:
  
Item: ${item}
Color Code: ${colorCode || 'N/A'}
Quantity Needed: ${qtyNeeded} units

Please confirm availability and best rate.`;

  // 2. Convert to URL format
  const encodedMessage = encodeURIComponent(message);
  
  // 3. Open WhatsApp (Web or App)
  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
};
  
  const handleSaveOrder = () => {
    if (!orderName) return;
    const validReqs = requirements.filter(r => r.inventoryItemId && r.amountNeeded > 0);
    if (validReqs.length === 0) return;
    onSaveOrder(orderName, validReqs);
    setOrderName('');
    setRequirements([{ inventoryItemId: '', inventoryItemName: '', amountNeeded: 0 }]);
    setPlanResult(null);
    setActiveSubTab('history');
  };

  return (

{/* Shortage Warning Card */}
<div className="p-6 mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-md">
  <div className="flex items-center gap-3 mb-2">
    <div className="p-2 bg-red-500/20 rounded-full text-red-400">⚠️</div>
    <h3 className="text-xl font-bold text-white">Shortage Detected</h3>
  </div>
  
  <p className="text-slate-300 mb-4">
    You are short by <span className="font-bold text-red-400">{missingQty} units</span> of {itemName}.
  </p>

  {/* --- WHATSAPP BUTTON --- */}
  <button
    onClick={() => handleWhatsApp(itemName, missingQty, colorCode)}
    className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-bold transition-all w-full justify-center shadow-lg"
  >
    {/* WhatsApp Icon */}
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
    Order via WhatsApp
  </button>
</div>
    
    <div className="space-y-8 animate-fade-in">
      <div className="flex gap-6 border-b border-slate-700/50 pb-2">
        <button onClick={() => setActiveSubTab('new')} className={`text-sm font-bold pb-2 transition-colors ${activeSubTab === 'new' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}>New Plan</button>
        <button onClick={() => setActiveSubTab('history')} className={`text-sm font-bold pb-2 transition-colors ${activeSubTab === 'history' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}>Order History</button>
      </div>

      {activeSubTab === 'new' && (
        <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6">Create Requirement Plan</h2>
            <div className="space-y-6">
                <input 
                  type="text"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  placeholder="Order Reference Name"
                  className="glass-input w-full p-4 text-lg"
                />

                <div className="space-y-4">
                    {requirements.map((req, index) => (
                        <div key={index} className="flex gap-4 items-center">
                            <select 
                              value={req.inventoryItemId}
                              onChange={(e) => updateRequirement(index, 'inventoryItemId', e.target.value)}
                              className="glass-input flex-1 p-3 cursor-pointer"
                            >
                                <option value="" className="bg-slate-900">Select Material</option>
                                {inventory.map(item => <option key={item.id} value={item.id} className="bg-slate-900">{item.name} (Stock: {item.quantity})</option>)}
                            </select>
                            <input 
                              type="number"
                              value={req.amountNeeded}
                              onChange={(e) => updateRequirement(index, 'amountNeeded', parseInt(e.target.value) || 0)}
                              placeholder="Qty"
                              className="glass-input w-24 p-3 text-center"
                            />
                            {requirements.length > 1 && (
                                <button onClick={() => removeRequirement(index)} className="p-3 text-slate-500 hover:text-red-400"><Trash2 size={20} /></button>
                            )}
                        </div>
                    ))}
                    <button onClick={addRequirement} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2"><Plus size={16} /> Add Material</button>
                </div>

                <div className="flex gap-4 pt-6">
                   <button onClick={checkPlan} className="btn-secondary flex-1 py-3 font-bold">Check Availability</button>
                   {planResult?.sufficient && orderName && (
                        <button onClick={handleSaveOrder} className="btn-hyper flex-1 py-3 font-bold shadow-lg">Save Order</button>
                   )}
                </div>
            </div>

            {planResult && !planResult.sufficient && (
                <div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-4"><AlertOctagon /> Shortage Detected</h3>
                    <div className="space-y-2">
                        {planResult.shortages.map((s, i) => (
                            <div key={i} className="flex justify-between text-sm border-b border-amber-500/10 pb-2"><span className="text-white">{s.name}</span><span className="text-amber-400 font-bold">Need {s.diff} more</span></div>
                        ))}
                    </div>
                </div>
            )}
            
            {planResult && planResult.sufficient && (
                <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                    <CheckCircle2 className="text-emerald-400 w-8 h-8" />
                    <div><h3 className="text-emerald-400 font-bold">Stock Available</h3><p className="text-slate-400 text-sm">Ready to fulfill this order.</p></div>
                </div>
            )}
        </div>
      )}

      {activeSubTab === 'history' && (
         <div className="space-y-4">
            {orders.length === 0 && <p className="text-center text-slate-500 py-10">No orders saved.</p>}
            {orders.map(order => (
               <div key={order.id} className="glass-card p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div><h4 className="font-bold text-white text-lg">{order.customerName}</h4><p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleDateString()}</p></div>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{order.status}</span>
                  </div>
                  {order.status === 'PENDING' && (
                    <button onClick={() => onCompleteOrder(order.id)} className="w-full btn-secondary py-2 text-sm font-bold border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300">Complete & Deduct Stock</button>
                  )}
               </div>
            ))}
         </div>
      )}
    </div>
  );
};

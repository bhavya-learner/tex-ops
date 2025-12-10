import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ResultCard } from './components/ResultCard';
import { InventoryView } from './components/InventoryView';
import { PlanningView } from './components/PlanningView';
import { LedgerView } from './components/LedgerView';
import { Toast, ToastMessage } from './components/Toast';
import { SettingsModal } from './components/SettingsModal';
import { AnalysisState, InventoryItem, InvoiceDetails, InvoiceRecord, Order, OrderRequirement, BackupData } from './types';
import { analyzeImageWithGemini } from './services/geminiService';
import { AlertTriangle, Scan, Package, Target, FileText, TrendingUp, AlertCircle, ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'inventory' | 'plan' | 'ledger'>('scan');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null,
  });

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ id: Date.now().toString(), type, message });
  };

  // Load persistence logic (omitted for brevity, same as before)
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('texops_inventory') || '[]'); } catch { return []; }
  });
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem('texops_invoices') || '[]'); } catch { return []; }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try { return JSON.parse(localStorage.getItem('texops_orders') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('texops_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('texops_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('texops_orders', JSON.stringify(orders)); }, [orders]);

  // Dashboard Stats
  const totalSpend = invoices.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const totalItems = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = inventory.filter(i => i.quantity < 50).length;

  const handleImageSelected = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setAnalysisState({ loading: true, result: null, error: null });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        
        try {
          const data = await analyzeImageWithGemini(base64Content, file.type);
          setAnalysisState({ loading: false, result: data, error: null });

          if (data.category === 'SHELF' && data.shelfData) {
            const newItem: InventoryItem = {
              id: Date.now().toString(),
              name: data.shelfData.itemType || data.summary.slice(0, 30) || "Shelf Item",
              quantity: data.shelfData.itemCount || 0,
              color: data.shelfData.dominantColors?.[0] || 'Mixed',
              colorCode: data.shelfData.colorCode || '', 
              lastUpdated: new Date().toLocaleDateString(),
            };
            setInventory(prev => [newItem, ...prev]);
            showToast('success', 'Item auto-added to stock!');
          }
        } catch (apiError) {
          console.error(apiError);
          setAnalysisState({ loading: false, result: null, error: "Analysis failed. Please try again." });
          showToast('error', 'Analysis failed');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setAnalysisState({ loading: false, result: null, error: "Error processing file." });
      showToast('error', 'File processing failed');
    }
  }, []);

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysisState({ loading: false, result: null, error: null });
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const saveInvoiceToRecords = (data: InvoiceDetails) => {
    const items = data.items || [];
    const newRecord: InvoiceRecord = {
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      vendorName: data.vendorName || "Unknown Vendor",
      gstNumber: data.gstNumber || "",
      date: data.date || new Date().toLocaleDateString(),
      items: items.map(i => ({
         name: i.name,
         quantity: Number(i.quantity) || 0,
         unitPrice: Number(i.unitPrice) || 0,
         total: Number(i.total) || 0
      })),
      taxAmount: Number(data.taxAmount) || 0,
      totalAmount: Number(data.totalAmount) || 0
    };
    
    setInvoices(prev => [newRecord, ...prev]);
    items.forEach(item => {
        if (item.quantity > 0 && item.name) {
            setInventory(prev => {
                const existingItemIndex = prev.findIndex(invItem => invItem.name.toLowerCase().trim() === item.name.toLowerCase().trim());
                if (existingItemIndex >= 0) {
                  const updated = [...prev];
                  updated[existingItemIndex] = {
                    ...updated[existingItemIndex],
                    quantity: updated[existingItemIndex].quantity + item.quantity,
                    lastUpdated: new Date().toLocaleDateString()
                  };
                  return updated;
                } else {
                  return [{
                    id: Date.now().toString() + Math.random().toString().slice(2,6),
                    name: item.name,
                    quantity: item.quantity,
                    color: 'N/A', 
                    colorCode: '',
                    lastUpdated: new Date().toLocaleDateString()
                  }, ...prev];
                }
            });
        }
    });
    showToast('success', 'Invoice Saved & Stock Updated');
  };

  const updateInvoiceRecord = (updated: InvoiceRecord) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    showToast('success', 'Invoice updated');
  };

  const handleSaveOrder = (name: string, requirements: OrderRequirement[]) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      customerName: name,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      requirements: requirements
    };
    setOrders(prev => [newOrder, ...prev]);
    showToast('success', 'Order Saved to History');
  };

  const handleCompleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    let updatedInventory = [...inventory];
    order.requirements.forEach(req => {
      const itemIndex = updatedInventory.findIndex(i => i.id === req.inventoryItemId);
      if (itemIndex >= 0) {
        updatedInventory[itemIndex] = {
          ...updatedInventory[itemIndex],
          quantity: Math.max(0, updatedInventory[itemIndex].quantity - req.amountNeeded),
          lastUpdated: new Date().toLocaleDateString()
        };
      }
    });
    setInventory(updatedInventory);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o));
    showToast('success', 'Order Completed & Stock Deducted');
  };

  // Backup/Restore Logic
  const handleBackup = () => {
    const data: BackupData = { inventory, invoices, orders, timestamp: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TexOps_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'Backup downloaded');
    setShowSettings(false);
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BackupData;
        if (Array.isArray(data.inventory)) {
          setInventory(data.inventory);
          setInvoices(data.invoices || []);
          setOrders(data.orders || []);
          showToast('success', 'Data restored');
          setShowSettings(false);
        }
      } catch { showToast('error', 'Invalid file'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative min-h-screen text-slate-200">
      
      <Header onOpenSettings={() => setShowSettings(true)} />
      
      <main className="w-full max-w-5xl mx-auto px-4 pt-28 pb-20 relative z-10 space-y-10">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex items-center gap-4 hover:bg-white/5 transition-colors">
             <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
               <TrendingUp size={24} />
             </div>
             <div>
               <p className="text-sm text-slate-400 font-bold uppercase tracking-wide">Total Spend</p>
               <p className="text-2xl font-extrabold text-white">₹{totalSpend.toLocaleString()}</p>
             </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 hover:bg-white/5 transition-colors">
             <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
               <ShoppingBag size={24} />
             </div>
             <div>
               <p className="text-sm text-slate-400 font-bold uppercase tracking-wide">In Stock</p>
               <p className="text-2xl font-extrabold text-white">{totalItems} Units</p>
             </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 hover:bg-white/5 transition-colors">
             <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
               <AlertCircle size={24} />
             </div>
             <div>
               <p className="text-sm text-slate-400 font-bold uppercase tracking-wide">Alerts</p>
               <p className={`text-2xl font-extrabold ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-500'}`}>{lowStockCount} Low Items</p>
             </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
           <div className="glass-nav p-1.5 flex gap-2">
             {[
               { id: 'scan', label: 'Scan', icon: <Scan size={18} /> },
               { id: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
               { id: 'ledger', label: 'Ledger', icon: <FileText size={18} /> },
               { id: 'plan', label: 'Plan', icon: <Target size={18} /> }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                   activeTab === tab.id 
                     ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105' 
                     : 'text-slate-400 hover:text-white hover:bg-white/10'
                 }`}
               >
                 {tab.icon} {tab.label}
               </button>
             ))}
           </div>
        </div>

        {/* Dynamic Content */}
        <div className="min-h-[400px]">
          {activeTab === 'scan' && (
            <div className="space-y-8 animate-float">
              {!previewUrl && (
                <div className="text-center py-8">
                  <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Factory Intelligence</h2>
                  <p className="text-slate-400">AI-Powered Analysis for Modern Manufacturing</p>
                </div>
              )}
              <UploadSection 
                onImageSelected={handleImageSelected} 
                previewUrl={previewUrl} 
                onClear={clearImage}
                loading={analysisState.loading}
              />
              {analysisState.error && (
                <div className="glass-card p-4 border-l-4 border-red-500 bg-red-500/10 text-red-200">
                  <p className="font-bold flex items-center gap-2"><AlertTriangle size={18} /> Analysis Error</p>
                  <p className="text-sm opacity-80 mt-1">{analysisState.error}</p>
                </div>
              )}
              {!analysisState.loading && analysisState.result && (
                <ResultCard data={analysisState.result} onSaveInvoice={saveInvoiceToRecords} />
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <InventoryView items={inventory} onDelete={deleteInventoryItem} onUpdate={updateInventoryItem} />
          )}

          {activeTab === 'ledger' && (
            <LedgerView invoices={invoices} onUpdate={updateInvoiceRecord} />
          )}

          {activeTab === 'plan' && (
            <PlanningView inventory={inventory} orders={orders} onSaveOrder={handleSaveOrder} onCompleteOrder={handleCompleteOrder} />
          )}
        </div>
        
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onBackup={handleBackup} onRestore={handleRestore} />}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default App;
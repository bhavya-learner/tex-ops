export enum ImageCategory {
  INVOICE = 'INVOICE',
  SHELF = 'SHELF',
  SKETCH = 'SKETCH',
  UNKNOWN = 'UNKNOWN'
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDetails {
  date?: string;
  totalAmount?: number;
  gstNumber?: string;
  vendorName?: string;
  items?: InvoiceItem[];
  taxAmount?: number;
}

export interface ShelfDetails {
  itemType?: string;
  itemCount?: number;
  dominantColors?: string[];
  colorCode?: string;
  quantityEstimate?: string;
}

export interface SketchDetails {
  designConcept?: string;
  fabricSuggestion?: string;
}

export interface AnalysisResult {
  category: ImageCategory;
  summary: string;
  invoiceData?: InvoiceDetails;
  shelfData?: ShelfDetails;
  sketchData?: SketchDetails;
}

export interface AnalysisState {
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  color: string;
  colorCode: string;
  lastUpdated: string;
}

export interface InvoiceRecord {
  id: string;
  vendorName: string;
  gstNumber: string;
  date: string;
  items: InvoiceItem[];
  taxAmount: number;
  totalAmount: number;
  savedAt: string;
}

export type OrderStatus = 'PENDING' | 'COMPLETED';

export interface OrderRequirement {
  inventoryItemId: string;
  inventoryItemName: string; // Store name snapshot
  amountNeeded: number;
}

export interface Order {
  id: string;
  customerName: string;
  createdAt: string;
  status: OrderStatus;
  requirements: OrderRequirement[];
}

export interface BackupData {
  inventory: InventoryItem[];
  invoices: InvoiceRecord[];
  orders: Order[];
  timestamp: string;
  version: string;
}
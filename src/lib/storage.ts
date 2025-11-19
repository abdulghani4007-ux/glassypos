// LocalStorage management utilities for pharmacy system

export interface Medicine {
  id: string;
  name: string;
  company: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  reorderLevel: number;
  expiry: string;
  batchNumber: string;
}

export interface CartItem {
  medicineId: string;
  name: string;
  company: string;
  price: number;
  quantity: number;
  discount: number;
  batchNumber: string;
  stock: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentType: 'cash' | 'card' | 'udhar';
  cashReceived?: number;
  changeReturned?: number;
  customerName?: string;
  customerPhone?: string;
}

export interface Expense {
  id: string;
  date: string;
  type: string;
  amount: number;
  note: string;
}

export interface RefundItem {
  medicineId: string;
  medicineName: string;
  company: string;
  batchNumber: string;
  quantity: number;           // Quantity being refunded
  originalQuantity: number;   // Original quantity in sale
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface Refund {
  id: string;
  saleId: string;
  invoiceNo: string;
  date: string;
  items: RefundItem[];
  amount: number;
  reason: 'defective' | 'expired' | 'wrong_item' | 'customer_request' | 'other';
  notes?: string;
  status: 'completed' | 'pending';
  customerName?: string;
  customerPhone?: string;
}

export interface Udhar {
  id: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  status: 'paid' | 'unpaid';
  date: string;
  dueDate?: string;
  paidDate?: string;
  invoiceNo: string;
  note?: string;
}

export interface Settings {
  shopName: string;
  currency: string;
  defaultTax: number;
  defaultDiscount: number;
  invoicePrefix: string;
  invoiceFooter: string;
  showCustomerInfo: boolean;
  enableUdhar: boolean;
  lowStockThreshold: number;
  expiryAlertDays: number;
  darkMode: boolean;
  glassyUI: boolean;
  compactSidebar: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

// Storage keys
export const STORAGE_KEYS = {
  MEDICINES: 'pharmacy_medicines',
  SALES: 'pharmacy_sales',
  EXPENSES: 'pharmacy_expenses',
  REFUNDS: 'pharmacy_refunds',
  SETTINGS: 'pharmacy_settings',
  UDHAR: 'pharmacy_udhar',
  USERS: 'pharmacy_users',
  STORAGE_METHOD: 'pharmacy_storage_method'
} as const;

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// Medicines
export function getMedicines(): Medicine[] {
  return getFromStorage<Medicine[]>(STORAGE_KEYS.MEDICINES, []);
}

export function saveMedicines(medicines: Medicine[]): void {
  saveToStorage(STORAGE_KEYS.MEDICINES, medicines);
}

export function addMedicine(medicine: Omit<Medicine, 'id'>): Medicine {
  const medicines = getMedicines();
  
  // Check for duplicate name + company
  const duplicate = medicines.find(
    m => m.name.toLowerCase() === medicine.name.toLowerCase() && 
         m.company.toLowerCase() === medicine.company.toLowerCase()
  );
  
  if (duplicate) {
    throw new Error('Medicine with same name and company already exists');
  }
  
  const newMedicine: Medicine = {
    ...medicine,
    id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  medicines.push(newMedicine);
  saveMedicines(medicines);
  return newMedicine;
}

export function updateMedicine(id: string, updates: Partial<Medicine>): void {
  const medicines = getMedicines();
  const index = medicines.findIndex(m => m.id === id);
  
  if (index === -1) {
    throw new Error('Medicine not found');
  }
  
  medicines[index] = { ...medicines[index], ...updates };
  saveMedicines(medicines);
}

export function deleteMedicine(id: string): void {
  const medicines = getMedicines();
  const filtered = medicines.filter(m => m.id !== id);
  saveMedicines(filtered);
}

export function updateMedicineStock(id: string, quantityChange: number): void {
  const medicines = getMedicines();
  const medicine = medicines.find(m => m.id === id);
  
  if (medicine) {
    medicine.stock += quantityChange;
    saveMedicines(medicines);
  }
}

// Sales
export function getSales(): Sale[] {
  return getFromStorage<Sale[]>(STORAGE_KEYS.SALES, []);
}

export function saveSales(sales: Sale[]): void {
  saveToStorage(STORAGE_KEYS.SALES, sales);
}

export function addSale(sale: Omit<Sale, 'id'>): Sale {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  sales.push(newSale);
  saveSales(sales);
  
  // Update stock for all items
  sale.items.forEach(item => {
    updateMedicineStock(item.medicineId, -item.quantity);
  });
  
  return newSale;
}

// Expenses
export function getExpenses(): Expense[] {
  return getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
}

export function saveExpenses(expenses: Expense[]): void {
  saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
}

export function addExpense(expense: Omit<Expense, 'id'>): Expense {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  saveExpenses(filtered);
}

// Refunds
export function getRefunds(): Refund[] {
  return getFromStorage<Refund[]>(STORAGE_KEYS.REFUNDS, []);
}

export function saveRefunds(refunds: Refund[]): void {
  saveToStorage(STORAGE_KEYS.REFUNDS, refunds);
}

export function addRefund(refund: Omit<Refund, 'id'>): Refund {
  const refunds = getRefunds();
  const newRefund: Refund = {
    ...refund,
    id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  refunds.push(newRefund);
  saveRefunds(refunds);
  
  // Restore stock
  refund.items.forEach(item => {
    updateMedicineStock(item.medicineId, item.quantity);
  });
  
  return newRefund;
}

// Find all sales containing a specific medicine
export function getSalesByMedicineId(medicineId: string): Sale[] {
  const sales = getSales();
  return sales.filter(sale => 
    sale.items.some(item => item.medicineId === medicineId)
  );
}

// Find all sales containing medicine by name (fuzzy search)
export function getSalesByMedicineName(searchTerm: string): Sale[] {
  const sales = getSales();
  const lowerSearch = searchTerm.toLowerCase();
  return sales.filter(sale =>
    sale.items.some(item => 
      item.name.toLowerCase().includes(lowerSearch)
    )
  );
}

// Get refunds for a specific sale
export function getRefundsBySaleId(saleId: string): Refund[] {
  const refunds = getRefunds();
  return refunds.filter(r => r.saleId === saleId);
}

// Calculate how much of an item has already been refunded
export function getRefundedQuantity(saleId: string, medicineId: string): number {
  const refunds = getRefundsBySaleId(saleId);
  return refunds.reduce((total, refund) => {
    const item = refund.items.find(i => i.medicineId === medicineId);
    return total + (item?.quantity || 0);
  }, 0);
}

// Calculate partial refund amount (proportional to original sale)
export function calculatePartialRefundAmount(
  sale: Sale,
  selectedItems: RefundItem[]
): number {
  let refundAmount = 0;
  
  selectedItems.forEach(refundItem => {
    // Base amount for the quantity
    const itemTotal = refundItem.unitPrice * refundItem.quantity;
    
    // Calculate proportional discount
    const itemDiscount = (refundItem.discount || 0) * refundItem.quantity;
    
    refundAmount += itemTotal - itemDiscount;
  });
  
  // Add proportional tax if original sale had tax
  if (sale.tax > 0) {
    const taxRate = sale.tax / sale.subtotal;
    refundAmount += refundAmount * taxRate;
  }
  
  return Math.round(refundAmount * 100) / 100;
}

// Validate refund request
export function canRefundItem(
  saleId: string,
  medicineId: string,
  requestedQuantity: number
): { valid: boolean; message?: string; availableQuantity?: number } {
  const sales = getSales();
  const sale = sales.find(s => s.id === saleId);
  
  if (!sale) {
    return { valid: false, message: "Sale not found" };
  }
  
  const saleItem = sale.items.find(i => i.medicineId === medicineId);
  if (!saleItem) {
    return { valid: false, message: "Item not found in sale" };
  }
  
  const alreadyRefunded = getRefundedQuantity(saleId, medicineId);
  const availableQuantity = saleItem.quantity - alreadyRefunded;
  
  if (availableQuantity <= 0) {
    return { 
      valid: false, 
      message: "All items have already been refunded",
      availableQuantity: 0
    };
  }
  
  if (requestedQuantity > availableQuantity) {
    return { 
      valid: false, 
      message: `Only ${availableQuantity} items available for refund`,
      availableQuantity
    };
  }
  
  return { valid: true, availableQuantity };
}

// Udhar
export function getUdhars(): Udhar[] {
  return getFromStorage<Udhar[]>(STORAGE_KEYS.UDHAR, []);
}

export function saveUdhars(udhars: Udhar[]): void {
  saveToStorage(STORAGE_KEYS.UDHAR, udhars);
}

export function addUdhar(udhar: Omit<Udhar, 'id'>): Udhar {
  const udhars = getUdhars();
  const newUdhar: Udhar = {
    ...udhar,
    id: Date.now().toString()
  };
  udhars.push(newUdhar);
  saveUdhars(udhars);
  return newUdhar;
}

export function updateUdhar(id: string, updates: Partial<Udhar>): void {
  const udhars = getUdhars();
  const index = udhars.findIndex(u => u.id === id);
  if (index !== -1) {
    udhars[index] = { ...udhars[index], ...updates };
    saveUdhars(udhars);
  }
}

export function deleteUdhar(id: string): void {
  const udhars = getUdhars().filter(u => u.id !== id);
  saveUdhars(udhars);
}

// Settings
export function getSettings(): Settings {
  return getFromStorage<Settings>(STORAGE_KEYS.SETTINGS, {
    shopName: 'MediStore Pharmacy',
    currency: 'Rs',
    defaultTax: 5,
    defaultDiscount: 0,
    invoicePrefix: 'INV-',
    invoiceFooter: 'Thank you for your business!',
    showCustomerInfo: true,
    enableUdhar: true,
    lowStockThreshold: 50,
    expiryAlertDays: 30,
    darkMode: false,
    glassyUI: true,
    compactSidebar: false,
  });
}

export function saveSettings(settings: Settings): void {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
}

// Users Management
export function getUsers(): User[] {
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  // If no users exist, create default admin
  if (users.length === 0) {
    const defaultAdmin: User = {
      id: 'user_admin_default',
      email: 'admin@medistore.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.USERS, [defaultAdmin]);
    return [defaultAdmin];
  }
  return users;
}

export function addUser(email: string, role: 'admin' | 'staff' = 'staff'): User {
  const users = getUsers();
  
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('User with this email already exists');
  }
  
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    role,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);
  return newUser;
}

export function updateUserRole(id: string, role: 'admin' | 'staff'): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  users[index] = { ...users[index], role };
  saveToStorage(STORAGE_KEYS.USERS, users);
}

export function deleteUser(id: string): void {
  const users = getUsers();
  
  // Don't allow deleting the last admin
  const admins = users.filter(u => u.role === 'admin');
  const userToDelete = users.find(u => u.id === id);
  
  if (userToDelete?.role === 'admin' && admins.length <= 1) {
    throw new Error('Cannot delete the last admin user');
  }
  
  saveToStorage(STORAGE_KEYS.USERS, users.filter(u => u.id !== id));
}

// Calculate totals
export function calculateTotals(items: CartItem[], globalDiscount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemDiscount = items.reduce((sum, item) => sum + (item.price * item.quantity * item.discount) / 100, 0);
  const totalDiscount = itemDiscount + (subtotal * globalDiscount) / 100;
  const settings = getSettings();
  const tax = (subtotal - totalDiscount) * (settings.defaultTax / 100);
  const total = subtotal - totalDiscount + tax;
  const profit = items.reduce((sum, item) => {
    const medicines = getMedicines();
    const medicine = medicines.find(m => m.id === item.medicineId);
    if (!medicine) return sum;
    const itemProfit = (item.price - medicine.costPrice) * item.quantity;
    return sum + itemProfit - (itemProfit * item.discount / 100);
  }, 0);
  
  return {
    subtotal,
    totalDiscount,
    tax,
    total,
    profit,
  };
}

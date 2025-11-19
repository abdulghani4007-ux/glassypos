import {
  Medicine,
  Sale,
  Expense,
  Refund,
  Udhar,
  Settings,
  User,
  getMedicines,
  getSales,
  getExpenses,
  getRefunds,
  getUdhars,
  getSettings,
  getUsers,
  saveMedicines,
  saveSales,
  saveExpenses,
  saveRefunds,
  saveUdhars,
  saveSettings,
  STORAGE_KEYS
} from './storage';

export type StorageMethod = 'localStorage' | 'supabase';

export interface StorageData {
  medicines: Medicine[];
  sales: Sale[];
  expenses: Expense[];
  refunds: Refund[];
  udhars: Udhar[];
  settings: Settings;
  users: User[];
  exportDate: string;
  version: string;
}

class StorageService {
  private currentMethod: StorageMethod = 'localStorage';

  getCurrentMethod(): StorageMethod {
    const saved = localStorage.getItem(STORAGE_KEYS.STORAGE_METHOD);
    if (saved === 'supabase' || saved === 'localStorage') {
      this.currentMethod = saved;
    }
    return this.currentMethod;
  }

  setStorageMethod(method: StorageMethod): void {
    this.currentMethod = method;
    localStorage.setItem(STORAGE_KEYS.STORAGE_METHOD, method);
  }

  // Export all data
  exportData(): StorageData {
    return {
      medicines: getMedicines(),
      sales: getSales(),
      expenses: getExpenses(),
      refunds: getRefunds(),
      udhars: getUdhars(),
      settings: getSettings(),
      users: getUsers(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import data
  importData(data: StorageData): void {
    if (!data.version) {
      throw new Error('Invalid data format');
    }

    saveMedicines(data.medicines || []);
    saveSales(data.sales || []);
    saveExpenses(data.expenses || []);
    saveRefunds(data.refunds || []);
    saveUdhars(data.udhars || []);
    
    if (data.settings) {
      saveSettings(data.settings);
    }
    
    if (data.users && data.users.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    }
  }

  // Download data as JSON file
  downloadData(): void {
    const data = this.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.STORAGE_METHOD) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get data statistics
  getDataStats() {
    return {
      medicines: getMedicines().length,
      sales: getSales().length,
      expenses: getExpenses().length,
      refunds: getRefunds().length,
      udhars: getUdhars().length,
      users: getUsers().length
    };
  }
}

export const storageService = new StorageService();

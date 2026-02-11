
import { Ink, UsageRecord, AppData, AppSettings, ViewType } from '../types';

const STORAGE_KEYS = {
  INKS: 'inks-data-v2',
  RECORDS: 'records-data-v2',
  SETTINGS: 'app-settings-v1'
};

const DEFAULT_SETTINGS: AppSettings = {
  activeTab: 'shelf',
  searchTerm: '',
  brandFilter: ''
};

const VIEW_TYPES: ViewType[] = ['shelf', 'refill', 'stats', 'manage', 'sync'];

const isValidSettings = (settings: unknown): settings is AppSettings => {
  if (!settings || typeof settings !== 'object') {
    return false;
  }

  const candidate = settings as Record<string, unknown>;

  return VIEW_TYPES.includes(candidate.activeTab as ViewType)
    && typeof candidate.searchTerm === 'string'
    && typeof candidate.brandFilter === 'string';
};

const safeParse = <T>(data: string | null, fallback: T): T => {
  if (!data) {
    return fallback;
  }

  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
};

export const storageService = {
  getInks: (): Ink[] => {
    return safeParse<Ink[]>(localStorage.getItem(STORAGE_KEYS.INKS), []);
  },
  saveInks: (inks: Ink[]) => {
    localStorage.setItem(STORAGE_KEYS.INKS, JSON.stringify(inks));
  },
  getRecords: (): UsageRecord[] => {
    return safeParse<UsageRecord[]>(localStorage.getItem(STORAGE_KEYS.RECORDS), []);
  },
  saveRecords: (records: UsageRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },
  getSettings: (): AppSettings => {
    const settings = safeParse<unknown>(localStorage.getItem(STORAGE_KEYS.SETTINGS), DEFAULT_SETTINGS);
    return isValidSettings(settings) ? settings : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  
  // Cloud-like Export/Import Logic
  exportFullData: (): string => {
    const data: AppData = {
      inks: storageService.getInks(),
      records: storageService.getRecords(),
      settings: storageService.getSettings(),
      version: '2.0.0',
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data);
  },

  importFullData: (jsonString: string): boolean => {
    try {
      const data: AppData = JSON.parse(jsonString);
      if (Array.isArray(data.inks) && Array.isArray(data.records)) {
        storageService.saveInks(data.inks);
        storageService.saveRecords(data.records);
        if (data.settings && isValidSettings(data.settings)) {
          storageService.saveSettings(data.settings);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  },

  downloadAsFile: () => {
    const dataStr = storageService.exportFullData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ink-library-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
